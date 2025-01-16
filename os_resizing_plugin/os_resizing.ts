/**
 * The `Resizer` class provides functionality to create a resizable element on a canvas.
 * It initializes with default dimensions for a card and a resize element, and maintains
 * the aspect ratio during resizing.
 *
 * @remarks
 * The class creates a content div element, a resize element, and a button to trigger the resize.
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
 * @method test_div - Creates and styles a content div element, and appends it to the canvas parent.
 * @method force_canvas_size - Forces the content div element to match the canvas size.
 * @method create_resize_element - Creates a resizable element and appends it to the content div.
 * @method create_drag_element - Creates a draggable element for resizing and appends it to the resize element.
 * @method create_btn - Creates a button to trigger the resize and appends it to the content div.
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
    calculated_dpi: number;
    runner: any; // TODO: add variables to runner vars
    view_distance: number;
    development_dpi: number;
    development_distance: number;
    scale_factor: number;
    use_perceived_distance: boolean;


    constructor(runner: any, use_perceived_distance: boolean, development_dpi: number, development_distance: number) { // TODO: add DPI and bool for perceived distance
        this.development_dpi = development_dpi;
        this.development_distance = development_distance;
        this.use_perceived_distance = use_perceived_distance;
        this.runner = runner;
        this.main();
    }

    private main() {
        var content_wrapper = this.create_content_wrapper();
        this.content_div(content_wrapper);
        this.resize_object();
        this.get_keyboard_response = this.get_keyboard_response.bind(this);
    }

    /**
     * Creates and styles a content wrapper div element, and appends it to the body.
     * @returns {HTMLElement} The content wrapper div element.
     */
    create_content_wrapper() {
        const content_wrapper = document.createElement('div');
        content_wrapper.id = 'content-wrapper';
        content_wrapper.style.display = 'flex';
        content_wrapper.style.flexDirection = 'column';
        content_wrapper.style.margin = 'auto';
        content_wrapper.style.width = '100%';
        content_wrapper.style.flex = '1 1 100%';
        content_wrapper.style.overflowY = 'auto';
        document.body.appendChild(content_wrapper);
        return content_wrapper;
    }

    /**
     * Creates and styles a content div element, and appends it to the canvas parent.
     * @returns {void}
     */
    private content_div(content_wrapper: HTMLElement): void {
        var content = document.createElement('div');
        content.id = 'content';
        content.style.textAlign = 'center';
        content.style.margin = 'auto';

        document.body.getElementsByTagName('main')[0].style.display = 'none';

        let insert_name = document.createElement('div');
        insert_name.id = 'insert_name';
        insert_name.style.width = '900px';
        insert_name.style.margin = '0 auto';

        this.create_resize_element(insert_name);
        this.create_btn(insert_name);
        content.appendChild(insert_name);
        content_wrapper.appendChild(content);
    }

    /**
     * Creates the resizing element and appends it to the content div.
     * @param content content div element that will contain the resize element
     */
    private create_resize_element(insert_name: HTMLElement): void {
        let page_size = document.createElement('div');
        page_size.id = 'page_size';
        insert_name.appendChild(page_size);
        this.aspect_ratio = this.init_width / this.init_height;
        let resize_element = document.createElement('div');
        resize_element.id = 'resize_element';
        let start_div_height = 
            this.aspect_ratio < 1 ? this.init_resize_element : Math.round(this.init_resize_element / this.aspect_ratio); // aspect ratio < 1 means width < height
        let start_div_width = 
            this.aspect_ratio < 1 ? Math.round(this.init_resize_element / this.aspect_ratio) : this.init_resize_element;
        var adjust_size = Math.round(start_div_width * 0.1);
        
        resize_element.style.border = 'none';
        resize_element.style.height = start_div_height + 'px';
        resize_element.style.width = start_div_width + 'px';
        resize_element.style.margin = '5px auto';
        resize_element.style.background = '#006600';
        resize_element.style.position = 'relative';

        this.create_drag_element(resize_element, adjust_size);
        page_size.appendChild(resize_element);
    }

    /**
     * Creates a draggable element for resizing and appends it to the resize element.
     * @param resize_element Resize element that will contain the drag element
     * @param adjust_size The size of the drag element in pixels
     */
    private create_drag_element(resize_element: HTMLElement, adjust_size: number) {
        let drag_element = document.createElement('div');
        drag_element.id = 'drag_element';
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
        resize_element.appendChild(drag_element);
    }

    /**
     * Creates a button to trigger the resize and appends it to the content div.
     * @param content content div element that contains the resize element
     */
    private create_btn(insert_name: HTMLElement) {
        let btn = document.createElement('button');
        btn.id = 'resize_btn';
        btn.textContent = 'Resize';

        btn.style.display = 'inline-block';
        btn.style.margin = '0.75em';
        btn.style.textAlign = 'center';
        btn.style.verticalAlign = 'middle';
        btn.style.position = 'relative';
        btn.style.bottom = '0';

        insert_name.appendChild(btn);
    }

    /**
     * Handles the resizing logic and updates the canvas size based on the resize element.
     * @returns {void}
     * @throws {Error} Resize element not found
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
            this.px2mm = element_width / this.init_width;
            this.calculated_dpi = this.px2mm / 0.03937;
            if (this.use_perceived_distance) {
                this.start_blindspot_task();
            } else {
                this.end_resizing_task();
            }
        });
    }

    /**
     * Starts the blindspot task.
     */
    start_blindspot_task() {
        let div = document.querySelector<HTMLElement>('#insert_name');
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

    /**
     * Get a keyboard response.
     * @param callback_function function to be triggered on response 
     * @param valid_responses array of valid responses
     * @param persist whether to keep the listener after a valid response
     * @param allow_held_keys allow held keys
     * @param minimum_rt set a minimum response time
     */
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

    /**
     * Start the ball animation.
     */
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

    /**
     * Record the ball position.
     */
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

    /**
     * Finalize the blindspot task.
     */
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

    /**
     * Reset the ball and wait for the start.
     */
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

    /**
     * adds event listeners to the root element, which allow the keyboard responses to trigger functions.
     */
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

    /**
     * Check if a response is valid.
     * @param valid_responses array of valid responses
     * @param allow_held_keys allow held keys
     * @param key key to check
     * @returns boolean
     */	
    check_valid_response(valid_responses: string[], allow_held_keys: boolean = false, key: string) {
        if (!allow_held_keys && this.held_keys.has(key)) {
            return false;
        }

        if (valid_responses.includes(key)) {
            return true;
        }

        return false;
    }

    /**
     * Get the center of an element.
     * @param el element
     * @returns object with x and y coordinates
     */	
    getElementCenter(el: HTMLElement) {
        const box = el.getBoundingClientRect();
        return {
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        };
    }

    /**
     * removes the event listeners from the root element, which allow the keyboard responses to trigger functions.
     */ 
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

    /**
     * Rounds a number to a specified number of decimal places.
     * @param value number to round
     * @param decimals number of decimal places
     * @returns rounded number
     */
    accurate_round(value, decimals) {
        return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
    }
}

type KeyboardListener = (e: KeyboardEvent) => void; 