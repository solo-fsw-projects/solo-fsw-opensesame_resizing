/**
 * The `Resizer` class provides functionality to create a resizable element on a canvas.
 * It initializes with default dimensions for a card and a resize element, and maintains
 * the aspect ratio during resizing.
 *
 * @remarks
 * The class creates a test div element, a resize element, and a button to trigger the resize.
 * It also handles mouse events to allow dragging and resizing of the element.
 *
 * @example
 * ```typescript
 * const resizer = new Resizer();
 * ```
 *
 * @property {number} init_height - The initial height of the card in millimeters.
 * @property {number} init_width - The initial width of the card in millimeters.
 * @property {number} init_resize_element - The initial size of the resize element in pixels.
 * @property {number} aspect_ratio - The aspect ratio of the card (width/height).
 * @property {number} px2mm - The conversion factor from pixels to millimeters.
 *
 * @method test_div - Creates and styles a test div element, and appends it to the canvas parent.
 * @method force_canvas_size - Forces the test div element to match the canvas size.
 * @method create_resize_element - Creates a resizable element and appends it to the test div.
 * @method create_drag_element - Creates a draggable element for resizing and appends it to the resize element.
 * @method create_btn - Creates a button to trigger the resize and appends it to the test div.
 * @method resize_object - Handles the resizing logic and updates the canvas size based on the resize element.
 */
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
    runner: any;
    view_distance: number;


    constructor(runner: any) {
        this.runner = runner;
        this.test_div();
        this.resize_object();
        this.get_keyboard_response = this.get_keyboard_response.bind(this);
    }

    /**
     * Creates and styles a test div element, and appends it to the canvas parent.
     * @returns {void}
     */
    test_div(): void {
        var test = document.createElement('div');
        test.id = 'test';
        test.textContent = 'test';
        set_div_style();
        var canvas = document.getElementsByTagName('canvas')[0];
        this.force_canvas_size(test, canvas);
        this.create_resize_element(test);
        this.create_btn(test);
        var parent = canvas.parentElement;
        parent?.appendChild(test);

        function set_div_style() {
            test.style.display = 'inline-block';
            test.style.position = 'relative';
            test.style.top = '0';
            test.style.left = '0';
            test.style.right = '0';
            test.style.bottom = '0';
            test.style.margin = 'auto';
            test.style.justifyContent = 'center';
            test.style.alignItems = 'center';
            test.style.zIndex = '11';
        }
    }

    /**
     * This function forces the test div element to match the canvas size.
     * @param test div element that contains the resize element
     * @param canvas the canvas element created by OSWeb that contains the correct dimensions
     */
    force_canvas_size(test, canvas): void {
        if (test) {
            test.style.maxWidth = canvas.clientWidth + 'px';
            test.style.maxHeight = canvas.clientHeight + 'px';
            test.style.width = canvas.clientWidth + 'px';
            test.style.height = canvas.clientHeight + 'px';
            canvas.style.display = 'none';
        }
    }

    /**
     * Creates the resizing element and appends it to the test div.
     * @param test test div element that will contain the resize element
     */
    create_resize_element(test: HTMLElement): void {
        this.aspect_ratio = this.init_width / this.init_height;
        let resize_element = document.createElement('div');
        resize_element.id = 'resize_element';
        resize_element.style.position = 'relative';
        let start_div_height = 
            this.aspect_ratio < 1 ? this.init_resize_element : Math.round(this.init_resize_element / this.aspect_ratio); // aspect ratio < 1 means width < height
        let start_div_width = 
            this.aspect_ratio < 1 ? Math.round(this.init_resize_element / this.aspect_ratio) : this.init_resize_element;
        var adjust_size = Math.round(start_div_width * 0.1);
        resize_element.style.height = start_div_height + 'px';
        resize_element.style.width = start_div_width + 'px';
        resize_element.style.background = '#006600';
        resize_element.style.cursor = 'nwse-resize';
        this.create_drag_element(resize_element, adjust_size);
        test.appendChild(resize_element);
    }

    /**
     * Creates a draggable element for resizing and appends it to the resize element.
     * @param resize_element Resize element that will contain the drag element
     * @param adjust_size The size of the drag element in pixels
     */
    create_drag_element(resize_element: HTMLElement, adjust_size: number) {
        let drag_element = document.createElement('div');
        drag_element.id = 'drag_element';
        drag_element.style.position = 'absolute';
        drag_element.style.bottom = '0';
        drag_element.style.right = '0';
        drag_element.style.width = adjust_size + 'px';
        drag_element.style.height = adjust_size + 'px';
        drag_element.style.background = 'blue';
        drag_element.style.cursor = 'move';
        resize_element.appendChild(drag_element);
    }

    /**
     * Creates a button to trigger the resize and appends it to the test div.
     * @param test test div element that contains the resize element
     */
    create_btn(test: HTMLElement) {
        let btn = document.createElement('button');
        btn.id = 'resize_btn';
        btn.textContent = 'Resize';
        btn.style.position = 'relative';
        btn.style.bottom = '0';
        test.appendChild(btn);
    }

    /**
     * Handles the resizing logic and updates the canvas size based on the resize element.
     */
    resize_object() {
        this._complete_function_cache = this.runner._events._currentItem._complete; // cache the complete function
        this.runner._events._currentItem._complete = () => {}; // override the complete function
        let dragging = false;
        let resize_element = document.querySelector<HTMLElement>('#resize_element');
        if (!resize_element) {
            throw new Error('Resize element not found');
        };

        let original_height = parseInt(resize_element.style.height);
        let original_width = parseInt(resize_element.style.width);
        let origin_x, origin_y;

        document.addEventListener('mouseup', () => {
            dragging = false;
        })

        function mouse_down_event(e) {
            e.preventDefault();
            dragging = true;
            origin_x = e.pageX;
            origin_y = e.pageY;
        }

        document.querySelector('#drag_element')?.addEventListener('mousedown', mouse_down_event);

        document.addEventListener('mousemove', (e) => {
            if (dragging) {
                let dx = e.pageX - origin_x;
                let dy = e.pageY - origin_y;
                let new_width = original_width + dx;
                let new_height = original_height + dy;
                resize_element.style.width = new_width + 'px';
                resize_element.style.height = Math.round(new_height / this.aspect_ratio) + 'px';
            }
        });

        document.querySelector('#resize_btn')?.addEventListener('click', () => {
            let element_width = resize_element.getBoundingClientRect().width;
            this.px2mm = this.init_width / element_width;
            this.start_blindspot_task();
        });
    }

    start_blindspot_task() {
        let div = document.querySelector<HTMLElement>('#test');
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

        const square = this.container.querySelector<HTMLElement>("#virtual-chinrest-square");
        if (!square) {
            throw new Error('Virtual chinrest square not found');
        }

        this.ball = ball_div;

        this.blindspot_data["square_pos"] = this.getElementCenter(square).x, 2;
        
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
                console.log('response', e.key, rt);
                console.log('function', callback_function);
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
        const x = parseInt(this.ball.style.left);
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
        const avg = sum / this.blindspot_data.ball_pos.length;
        this.blindspot_data.avg_ball_pos = avg;
        const ball_square_distance = (this.blindspot_data.square_pos - avg) / this.px2mm;

        this.view_distance = ball_square_distance / Math.tan(angle * Math.PI / 180);
        
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

        this.blindspot_data.square_pos = rectX;

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
}

type KeyboardListener = (e: KeyboardEvent) => void; 