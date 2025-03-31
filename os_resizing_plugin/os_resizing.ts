/**
 * Resizer class for the OpenSesame web plugin.
 * 
 * This class is responsible for managing the resizing task and the blindspot task.
 * It provides methods to resize an object on the page and to perform a blindspot task
 * to calculate the view distance and scaling factor.
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
    private reps_remaining: number = 5;
    private blindspot_data = {
        ball_pos: [] as number[],
        avg_ball_pos: 0,
        square_pos: 0,
    };
    private development_distance: number;
    private canvas_width_in_mm: number;
    private use_perceived_distance: boolean;
    aspect_ratio: number;
    px2mm: number;
    calculated_dpi: number;
    runner: any;
    view_distance: number;
    scaling_factor: number;
    squeeze: number = 0;
    complete: boolean = false;

    /**
     * Constructs an instance of the class.
     * 
     * @param runner - The runner instance responsible for managing the execution.
     * @param use_perceived_distance - A boolean indicating whether to use perceived distance.
     * @param canvas_width_in_mm - The width of the canvas in millimeters.
     * @param development_distance - The development distance parameter.
     */
    constructor(runner: any, use_perceived_distance: boolean, canvas_width_in_mm: number, development_distance: number) {
        this.canvas_width_in_mm = canvas_width_in_mm;
        this.development_distance = development_distance;
        this.use_perceived_distance = use_perceived_distance;
        this.runner = runner;
        this.osweb_main();
    }

    /**
     * Main function to initialize and manage the OpenSesame web plugin.
     * 
     * This function performs the following tasks:
     * - Caches the runner instance.
     * - Hides the main content of the document body.
     * - Creates a content wrapper element.
     * - Creates a content div inside the wrapper.
     * - Creates a button inside the content div.
     * - Resizes the object based on the given parameter.
     * - Binds the `get_keyboard_response` method to the current instance.
     * 
     * @private
     */
    private osweb_main() {
        document.body.getElementsByTagName('main')[0].style.display = 'none';
        const content_wrapper = this.create_content_wrapper();
        let box = this.content_div(content_wrapper);
        this.create_btn(box);
        this.resize_object(false);
        this.get_keyboard_response = this.get_keyboard_response.bind(this);
    }

    /**
     * Creates a content wrapper div element, applies specific styles to it, 
     * and appends it to the document body.
     *
     * @returns {HTMLDivElement} The created content wrapper div element.
     *
     * The content wrapper is styled with the following properties:
     * - display: flex
     * - flex-direction: column
     * - justify-content: center
     * - align-items: center
     * - width: 100%
     * - margin: auto
     * - flex: 1 1 100%
     * - overflow-y: auto
     */
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

    private content_div(content_wrapper: HTMLElement): HTMLElement {
        let content = document.createElement('div');
        content.id = 'content';
        content.style.textAlign = 'center';
        content.style.margin = 'auto';

        const boundary_box = document.createElement('div');
        boundary_box.id = 'boundary_box';
        boundary_box.style.width = '900px';
        boundary_box.style.margin = '0 auto';

        const instructions = document.createElement('p');
        instructions.textContent = 'Please hold a credit card up to the screen and resize the box below to match the size of the credit card. This will help us calculate the accurate DPI for your display. \n Click on the bottom right corner of the box and drag to resize it.';
        instructions.style.marginBottom = '20px';
        content_wrapper.appendChild(instructions);

        this.create_resize_element(boundary_box);
        content.appendChild(boundary_box);
        content_wrapper.appendChild(content);
        return boundary_box;
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
            drag_element.style.border = '3px solid red';
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
            btn.textContent = 'Finish';
            btn.style.display = 'inline-block';
            btn.style.margin = '0.75em';
            btn.style.textAlign = 'center';
            btn.style.verticalAlign = 'middle';
            btn.style.position = 'relative';
            btn.style.bottom = '0';
        }
    }

    /**
     * Resizes an object on the page, allowing for dynamic adjustment of its dimensions
     * through mouse interactions. Optionally displays the calculated DPI (dots per inch)
     * if the `static_page` parameter is true.
     *
     * @param {boolean} static_page - Determines whether to display the DPI information.
     *
     * @throws {Error} If the resize element is not found in the DOM.
     *
     * @remarks
     * - The function sets up event listeners for mouse events to handle the resizing logic.
     * - When the mouse is pressed down on the drag element, resizing starts.
     * - When the mouse is moved, the width and height of the resize element are adjusted
     *   based on the mouse movement.
     * - If `static_page` is true, a DPI text element is created and updated with the
     *   calculated DPI value during resizing.
     * - When the resize button is clicked, the resizing task is either ended or a blindspot
     *   task is started based on the `use_perceived_distance` property.
     */
    resize_object(static_page: boolean) {
        let dragging = false;
        var resize_element = document.querySelector<HTMLElement>('#resize_element');
        if (!resize_element) {
            throw new Error('Resize element not found');
        };

        let original_width = parseInt(resize_element.style.width);
        let origin_x;
        let dpi_text;
        let calculated_dpi = 0;

        document.addEventListener('mouseup', () => {
            dragging = false;
            if (resize_element) {
                let element_width = resize_element.getBoundingClientRect().width;
                original_width = element_width;
            }
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
            let new_height = Math.round(new_width / this.aspect_ratio);
            if (resize_element) {
                resize_element.style.width = new_width + 'px';
                resize_element.style.height = new_height + 'px';
            }

            if (static_page) {
                let calculated_dpi_width = new_width / this.init_width / 0.03937;
                let calculated_dpi_height = new_height / this.init_height / 0.03937;
                calculated_dpi = (calculated_dpi_width + calculated_dpi_height) / 2;
                dpi_text.innerText = `DPI: ${calculated_dpi}`;
            }            
        });


        document.querySelector('#resize_btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (!resize_element) {
                throw new Error('Resize element is null');
            }
            let element_width = resize_element.getBoundingClientRect().width;
            this.px2mm = element_width / this.init_width;
            this.calculated_dpi = this.px2mm / 0.03937;

            const instructions = document.querySelector('#content-wrapper p');
            if (instructions) {
                instructions.remove();
            }

            if (this.use_perceived_distance) {
                this.start_blindspot_task();
            } else {
                this.end_resizing_task();
            }
        });
    }

    /**
     * Initializes and starts the blind spot task. This function sets up the HTML content
     * for the task, including instructions and interactive elements. It also adds necessary
     * event listeners and prepares the visual elements for the task.
     * 
     * @throws {Error} If the boundary box or SVG element is not found.
     */
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

    /**
     * Listens for keyboard responses and triggers a callback function when a valid response is detected.
     *
     * @param callback_function - The function to call when a valid response is detected. It receives an object containing the key pressed and the reaction time.
     * @param valid_responses - An array of valid key responses.
     * @param persist - If true, the listener will persist after a valid response is detected. Otherwise, it will be removed.
     * @param allow_held_keys - If true, allows responses from keys that are held down.
     * @param minimum_rt - The minimum reaction time (in milliseconds) required for a response to be considered valid.
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
            e.preventDefault();
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
     * Initiates the ball animation and sets up a keyboard response listener.
     * 
     * This method performs the following actions:
     * 1. Sets up a keyboard response listener that triggers the `record_position` method when the spacebar (' ') is pressed.
     * 2. Starts the ball animation by calling `requestAnimationFrame` with the `animate_ball` method.
     * 
     * @returns {void}
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
     * Records the current position of the ball, updates the remaining repetitions,
     * and updates the UI to reflect the number of repetitions left. If no repetitions
     * are left, it finalizes the blindspot task. Otherwise, it resets the ball and
     * waits for the next start.
     *
     * @remarks
     * - Cancels the current animation frame for the ball.
     * - Rounds the x-coordinate of the ball's center position to 2 decimal places.
     * - Pushes the rounded x-coordinate to the blindspot data.
     * - Decrements the remaining repetitions.
     * - Updates the text content of the element with id "click" to show the remaining repetitions.
     * - If repetitions are exhausted, calls `finalize_blindspot_task`.
     * - Otherwise, calls `reset_ball_wait_for_start` to reset the ball.
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
     * Finalizes the blindspot task by calculating the average ball position,
     * the ball-square distance, the view distance, and the scaling factor.
     * It also removes root event listeners and ends the resizing task.
     *
     * @remarks
     * - The angle used for the calculation is 13.5 degrees.
     * - The average ball position is calculated to two decimal places.
     * - The view distance is calculated using the tangent of the angle.
     * - The scaling factor is the ratio of the view distance to the development distance.
     *
     * @private
     */
    finalize_blindspot_task() {
        const angle = 13.5;
        const sum = this.blindspot_data.ball_pos.reduce((a, b) => a + b, 0);
        const avg = this.accurate_round(sum / this.blindspot_data.ball_pos.length, 2);
        this.blindspot_data.avg_ball_pos = avg;
        const ball_square_distance = (this.blindspot_data['square_pos'] - avg) / this.px2mm;

        this.view_distance = ball_square_distance / Math.tan((angle * Math.PI) / 180);
        this.scaling_factor = this.view_distance / this.development_distance;
        this.remove_root_event_listeners();
        this.end_resizing_task();
    }

    /**
     * Ends the resizing task by adjusting the dimensions of the canvas element
     * and updating the display properties of certain elements on the page.
     * 
     * @throws {Error} If the div with id 'content' or the canvas element is not found.
     * 
     * @remarks
     * - If `scaling_factor` is undefined, the new dimensions are calculated based on
     *   the device's pixel ratio and the canvas width in millimeters.
     * - Otherwise, the new dimensions are calculated using the `scaling_factor` and
     *   the experiment's width and height variables.
     * - Ensures the new dimensions do not exceed the available screen dimensions.
     * - Updates the canvas element's width and height styles.
     * - Sets the display style of the main element to 'flex'.
     * - Marks the task as armed and completes the current item in the runner's event queue.
     * 
     * @privateRemarks
     * - The `_complete_function_cache` line is commented out and may be used for future reference.
     */
    end_resizing_task() {
        let div = document.querySelector<HTMLElement>('#content');
        if (!div) { 
            throw new Error('Test div not found');
        }
        div.style.display = 'none';
        
        let canvas = document.getElementsByTagName('canvas')[0];
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        const canvas_aspect_ratio = canvas.width / canvas.height;
        
        let new_width, new_height;
        if (this.scaling_factor == undefined) {
            const pixel_width = Math.round(this.canvas_width_in_mm * this.calculated_dpi / 25.4);

            new_width = pixel_width;
            new_height = (pixel_width / canvas_aspect_ratio);
            this.scaling_factor = canvas.width / new_width;
        }
        else {
            new_width = Math.round(this.runner._experiment.vars.get('width') * this.scaling_factor); 
            new_height = Math.round(this.runner._experiment.vars.get('height') * this.scaling_factor);
        }
        // this .runner._events._currentItem._complete = this._complete_function_cache;
        
        this.squeeze = new_width / window.screen.availWidth;
        
        if (new_height > window.screen.availHeight || new_width > window.screen.availWidth) {
            new_height = window.screen.availHeight;
            new_width = new_height * canvas_aspect_ratio;
        }
        canvas.style.width = `${new_width}px`;
        canvas.style.height = `${new_height}px`;
        document.body.getElementsByTagName('main')[0].style.display = 'flex';
        this.runner._experiment.vars.set('squeeze', this.squeeze);
        this.runner._experiment.vars.set('view_distance', this.view_distance);
        this.runner._experiment.vars.set('scaling_factor', this.scaling_factor);
        this.runner._experiment.vars.set('calculated_dpi', this.calculated_dpi);
        this.runner._experiment.vars.set('px2mm', this.px2mm);
        this.complete = true;
    }

    /**
     * Resets the ball position and waits for the start signal.
     * 
     * This method calculates the position of the ball and a virtual chinrest square
     * within a container element. It then sets the ball's position and the square's
     * position accordingly. The position of the square is stored in the `blindspot_data`
     * object. Finally, it sets up a keyboard response listener to start the ball movement
     * when the spacebar is pressed.
     * 
     * @throws {Error} If the virtual chinrest square element is not found.
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