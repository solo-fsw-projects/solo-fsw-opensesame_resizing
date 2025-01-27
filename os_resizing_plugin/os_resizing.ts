class Resizer {
    private init_height: number = 53.98;
    private init_width: number = 85.6;
    private init_resize_element: number = 250;
    private ball: HTMLElement;
    private container: HTMLElement;
    private ball_animation_frame_id: number;
    private listeners: KeyboardListener[] = [];
    private held_keys: Set<string> = new Set();
    private _complete_function_cache: any;
    reps_remaining: number = 5;
    blindspot_data = {
        ball_pos: [] as number[],
        avg_ball_pos: 0,
        square_pos: 0,
    };
    aspect_ratio: number;
    px2mm: number;
    calculated_dpi: number;
    runner: any; // TODO: add variables to runner vars
    view_distance: number;
    development_dpi: number;
    development_distance: number;
    scale_factor: number;
    use_perceived_distance: boolean;

    constructor(osweb: boolean, runner: any, use_perceived_distance: boolean, development_dpi: number, development_distance: number) {
        if (!osweb) {
            this.static_page_main();
            return;
        }

        this.development_dpi = development_dpi;
        this.development_distance = development_distance;
        this.use_perceived_distance = use_perceived_distance;
        this.runner = runner;
        this.osweb_main();
    }

    private static_page_main() {
        const content_wrapper = this.create_content_wrapper();
        this.content_div(content_wrapper);
        this.resize_object(true);
    }

    private osweb_main() {
        const content_wrapper = this.create_content_wrapper();
        this.content_div(content_wrapper);
        this.resize_object(false);
        this.get_keyboard_response = this.get_keyboard_response.bind(this);
    }

    create_content_wrapper() {
        const content_wrapper = document.createElement('div');
        content_wrapper.id = 'content-wrapper';
        add_style();

        document.body.appendChild(content_wrapper);
        return content_wrapper;

        function add_style() {
            content_wrapper.style.display = 'flex';
            content_wrapper.style.flexDirection = 'column';
            content_wrapper.style.justifyContent = 'center';
            content_wrapper.style.alignItems = 'center';
            content_wrapper.style.width = '100%';
            content_wrapper.style.margin = 'auto';
            content_wrapper.style.flex = '1 1 100%';
            content_wrapper.style.overflowY = 'auto';
        }
    }

    private content_div(content_wrapper: HTMLElement): void {
        document.body.getElementsByTagName('main')[0].style.display = 'none';

        let content = document.createElement('div');
        content.id = 'content';
        content.style.textAlign = 'center';
        content.style.margin = 'auto';

        const boundary_box = document.createElement('div');
        boundary_box.id = 'boundary_box';
        boundary_box.style.width = '900px';
        boundary_box.style.margin = '0 auto';

        this.create_resize_element(boundary_box);
        this.create_btn(boundary_box);
        content.appendChild(boundary_box);
        content_wrapper.appendChild(content);
    }

    private create_resize_element(boundary_box: HTMLElement): void {
        this.aspect_ratio = this.init_width / this.init_height;
        const resize_element = document.createElement('div');
        resize_element.id = 'resize_element';
        const start_div_height = 
        this.aspect_ratio < 1 ? this.init_resize_element : Math.round(this.init_resize_element / this.aspect_ratio); // aspect ratio < 1 means width < height
        const start_div_width = 
        this.aspect_ratio < 1 ? Math.round(this.init_resize_element / this.aspect_ratio) : this.init_resize_element;
        let adjust_size = Math.round(start_div_width * 0.1);
        
        add_style();
        
        this.create_drag_element(resize_element, adjust_size);
        boundary_box.appendChild(resize_element);

        function add_style() {
            resize_element.style.border = '2px solid black';
            resize_element.style.height = start_div_height + 'px';
            resize_element.style.width = start_div_width + 'px';
            resize_element.style.margin = '5px auto';
            resize_element.style.background = 'aquamarine';
            resize_element.style.position = 'relative';
        }
    }

    private create_drag_element(resize_element: HTMLElement, adjust_size: number) {
        const drag_element = document.createElement('div');
        drag_element.id = 'drag_element';
        add_style();
        resize_element.appendChild(drag_element);

        function add_style() {
            drag_element.style.position = 'absolute';
            drag_element.style.cursor = 'nwse-resize';
            drag_element.style.bottom = '0';
            drag_element.style.right = '0';
            drag_element.style.width = adjust_size + 'px';
            drag_element.style.height = adjust_size + 'px';
            drag_element.style.border = '1px solid red';
            drag_element.style.backgroundColor = 'none';
            drag_element.style.borderLeft = '0';
            drag_element.style.borderTop = '0';
            drag_element.style.cursor = 'move';
        }
    }

    private create_btn(boundary_box: HTMLElement) {
        const btn = document.createElement('button');
        btn.id = 'resize_btn';
        add_style();

        boundary_box.appendChild(btn);

        function add_style() {
            btn.textContent = 'Resize';
            btn.style.display = 'inline-block';
            btn.style.margin = '0.75em';
            btn.style.textAlign = 'center';
            btn.style.verticalAlign = 'middle';
            btn.style.position = 'relative';
            btn.style.bottom = '0';
        }
    }

    resize_object(static_page: boolean) { // TODO: add variable to make static page possible without blindspot task
        this._complete_function_cache = this.runner._events._currentItem._complete; // cache the complete function
        this.runner._events._currentItem._complete = () => {}; // override the complete function
        let dragging = false;
        const resize_element = document.querySelector<HTMLElement>('#resize_element');
        if (!resize_element) {
            throw new Error('Resize element not found');
        };

        const original_height = parseInt(resize_element.style.height);
        const original_width = parseInt(resize_element.style.width);
        let origin_x;
        let dpi_text;
        let calculated_dpi = 0;

        document.addEventListener('mouseup', () => {
            dragging = false;
        })

        function mouse_down_event(e) {
            e.preventDefault();
            dragging = true;
            origin_x = e.pageX;
        }

        document.querySelector('#drag_element')?.addEventListener('mousedown', mouse_down_event);

        if (static_page) {
            dpi_text = document.createElement('div');
            dpi_text.id = 'dpi_text';
            dpi_text.style.marginTop = '10px';
            dpi_text.innerText = `DPI: ${calculated_dpi.toFixed(2)}`;
            document.body.appendChild(dpi_text);
        }

        document.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (!dragging) {
                return;
            }

            let dx = e.pageX - origin_x;
            let new_width = original_width + dx;
            resize_element.style.width = new_width + 'px';
            resize_element.style.height = Math.round(new_width / this.aspect_ratio) + 'px';

            if (static_page) {
                calculated_dpi = new_width / this.init_width / 0.03937;
                dpi_text.innerText = `DPI: ${calculated_dpi.toFixed(2)}`;
            }            
        });


        document.querySelector('#resize_btn')?.addEventListener('click', () => {
            let element_width = resize_element.getBoundingClientRect().width;
            this.px2mm = element_width / this.init_width;
            this.calculated_dpi = this.px2mm / 0.03937;
            if (this.use_perceived_distance) {
                this.start_blindspot_task();
            } else {
                this.end_resizing_task();
            }
        });
    }

    start_blindspot_task() {
        let div = document.querySelector<HTMLElement>('#boundary_box');
        if (!div) {
            throw new Error('Test div not found');
        }
        
        let blindspot_content =  `
            <div id="blind-spot">
                <p>Now we will quickly measure how far away you are sitting.</p>
                <div style="text-align: left">
                    <ol>
                        <li>Put your left hand on the <b>space bar</b>.</li>
                        <li>Cover your right eye with your right hand.</li>
                        <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>
                        <li>The <span style="color: red; font-weight: bold;">red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>
                    </ol>
                </div>
                <p>Press the space bar when you are ready to begin.</p>
                <div id="svgDiv" style="height:100px; position:relative;"></div>
                    <button class="btn btn-primary" id="proceed" style="display:none;"> +
                       Yes +
                    </button>
                remaining measurements:
                <div id="click" style="display:inline; color: red"> ${this.reps_remaining} </div>
            </div>`;

        div.innerHTML = blindspot_content;
        let svg = document.querySelector<HTMLElement>('#svgDiv');
        if (!svg) {
            throw new Error('SVG element not found');
        }

        this.add_root_event_listeners();

        this.container = svg;
        this.container.innerHTML = `
        <div id="virtual-chinrest-circle" style="position: absolute; background-color: #f00; width: 30px; height: 30px; border-radius:30px;"></div>
        <div id="virtual-chinrest-square" style="position: absolute; background-color: #000; width: 30px; height: 30px;"></div>`;
        
        const ball_div = this.container.querySelector<HTMLElement>("#virtual-chinrest-circle");
        if (!ball_div) {
            throw new Error('Virtual chinrest circle not found');
        }

        this.ball = ball_div;
        
        this.reset_ball_wait_for_start();
    }

    get_keyboard_response(
        callback_function: (response: { key: string, rt: number }) => void,
        valid_responses: string[],
        persist: boolean,
        allow_held_keys: boolean,
        minimum_rt: number
    ): void {
        const start_time = performance.now();
        const listener = (e) => {
            if (this.check_valid_response(valid_responses, allow_held_keys, e.key)) {
                const rt = performance.now() - start_time;
                if (rt < minimum_rt) {
                    return;
                }
                if (!persist) {
                    const index = this.listeners.indexOf(listener);
                    if (index > -1) {
                        this.listeners.splice(index, 1);
                    }
                }
                callback_function({key: e.key, rt});
            }
        };
        this.listeners.push(listener);
    }

    start_ball() {
        this.get_keyboard_response(
            this.record_position.bind(this),
            [' '],
            false,
            false,
            0
        );

        this.ball_animation_frame_id = requestAnimationFrame(this.animate_ball.bind(this));
    }

    record_position() {
        cancelAnimationFrame(this.ball_animation_frame_id);
        const x = this.accurate_round(this.getElementCenter(this.ball).x, 2);
        this.blindspot_data.ball_pos.push(x);
        this.reps_remaining--;


        (document.querySelector("#click") as HTMLDivElement).textContent = Math.max(
            this.reps_remaining,
            0).toString();

        if (this.reps_remaining <= 0) {
            this.finalize_blindspot_task();
        } else {
            this.reset_ball_wait_for_start();
        }
    }

    finalize_blindspot_task() {
        const angle = 13.5;
        const sum = this.blindspot_data.ball_pos.reduce((a, b) => a + b, 0);
        const avg = this.accurate_round(sum / this.blindspot_data.ball_pos.length, 2);
        this.blindspot_data.avg_ball_pos = avg;
        const ball_square_distance = (this.blindspot_data['square_pos'] - avg) / this.px2mm;

        this.view_distance = ball_square_distance / Math.tan((angle * Math.PI) / 180); // calculate view distance
        this.scale_factor = this.view_distance / this.development_distance; // calculate scaling factor
        this.remove_root_event_listeners();
        this.end_resizing_task();
    }

    end_resizing_task() {
        let div = document.querySelector<HTMLElement>('#content');
        if (!div) { // check if the test div exists
            throw new Error('Test div not found');
        }
        div.style.display = 'none';

        let new_width, new_height;
        if (this.scale_factor == undefined) {
            this.scale_factor = this.calculated_dpi / this.development_dpi; // calculate scaling factor
        }
        new_width = Math.round(this.runner._experiment.vars.get('width') * this.scale_factor); // calculate new width and height
        new_height = Math.round(this.runner._experiment.vars.get('height') * this.scale_factor);
        
        let canvas = document.getElementsByTagName('canvas')[0];
        if (!canvas) { // check if the canvas exists
            throw new Error('Canvas not found');
        }
        canvas.style.width = `${new_width}px`; // set the canvas width and height
        canvas.style.height = `${new_height}px`;
        canvas.style.display = 'inline-block';
        document.body.getElementsByTagName('main')[0].style.display = 'flex';

        this.runner._events._currentItem._complete = this._complete_function_cache;
    }

    reset_ball_wait_for_start() {
        const rectX = this.container.getBoundingClientRect().width - 30;
        const ballX = rectX * 0.85; // define where the ball is

        const square = this.container.querySelector<HTMLElement>("#virtual-chinrest-square");
        if (!square) {
            throw new Error('Virtual chinrest square not found');
        }

        this.ball.style.left = `${ballX}px`;
        square.style.left = `${rectX}px`;

        this.blindspot_data["square_pos"] = this.accurate_round(this.getElementCenter(square).x, 2);

        this.get_keyboard_response(
            this.start_ball.bind(this),
            [' '],
            false,
            false,
            0
        );
    }

    animate_ball() {
        const dx = -2;
        const x = parseInt(this.ball.style.left);
        this.ball.style.left = `${x + dx}px`;
        this.ball_animation_frame_id = requestAnimationFrame(this.animate_ball.bind(this));
    }

    add_root_event_listeners() {
        document.body.addEventListener('keydown', (e) => {
            for (const listener of [...this.listeners]) {
                try {
                    listener(e);
                }
                catch (error) {
                    console.error(error);
                }
            }
            this.held_keys.add(e.key);
        });

        document.body.addEventListener('keyup', (e) => {
            this.held_keys.delete(e.key);
        });
    }

    check_valid_response(valid_responses: string[], allow_held_keys: boolean = false, key: string) {
        if (!allow_held_keys && this.held_keys.has(key)) {
            return false;
        }

        if (valid_responses.includes(key)) {
            return true;
        }

        return false;
    }

    getElementCenter(el: HTMLElement) {
        const box = el.getBoundingClientRect();
        return {
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        };
    }

    remove_root_event_listeners() {
        this.listeners = [];
        document.body.removeEventListener('keydown', (e) => {
            this.held_keys.delete(e.key);
        });

        document.body.removeEventListener('keyup', (e) => {
            for (const listener of [...this.listeners]) {
                try {
                    listener(e);
                }
                catch (error) {
                    console.error(error);
                }
            }
            this.held_keys.add(e.key);
        });
    }

    accurate_round(value, decimals) {
        return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
    }
}

type KeyboardListener = (e: KeyboardEvent) => void; 