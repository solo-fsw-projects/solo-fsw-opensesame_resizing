var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Resizer class for the OpenSesame web plugin.
 *
 * This class is responsible for managing the resizing task and the blindspot task.
 * It provides methods to resize an object on the page and to perform a blindspot task
 * to calculate the view distance and scaling factor.
 */
var Resizer = /** @class */ (function () {
    /**
     * Constructs an instance of the class.
     *
     * @param runner - The runner instance responsible for managing the execution.
     * @param use_perceived_distance - A boolean indicating whether to use perceived distance.
     * @param canvas_width_in_mm - The width of the canvas in millimeters.
     * @param development_distance - The development distance parameter.
     */
    function Resizer(runner, use_perceived_distance, canvas_width_in_mm, development_distance) {
        this.init_height = 53.98;
        this.init_width = 85.6;
        this.init_resize_element = 250;
        this.listeners = [];
        this.held_keys = new Set();
        this.reps_remaining = 5;
        this.blindspot_data = {
            ball_pos: [],
            avg_ball_pos: 0,
            square_pos: 0,
        };
        this.squeeze = 0;
        this.complete = false;
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
    Resizer.prototype.osweb_main = function () {
        document.body.getElementsByTagName('main')[0].style.display = 'none';
        var content_wrapper = this.create_content_wrapper();
        var box = this.content_div(content_wrapper);
        this.create_btn(box);
        this.resize_object(false);
        this.get_keyboard_response = this.get_keyboard_response.bind(this);
    };
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
    Resizer.prototype.create_content_wrapper = function () {
        var content_wrapper = document.createElement('div');
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
    };
    Resizer.prototype.content_div = function (content_wrapper) {
        var content = document.createElement('div');
        content.id = 'content';
        content.style.textAlign = 'center';
        content.style.margin = 'auto';
        var boundary_box = document.createElement('div');
        boundary_box.id = 'boundary_box';
        boundary_box.style.width = '900px';
        boundary_box.style.margin = '0 auto';
        var instructions = document.createElement('p');
        instructions.textContent = 'Please hold a credit card up to the screen and resize the box below to match the size of the credit card. This will help us calculate the accurate DPI for your display.';
        instructions.style.marginBottom = '20px';
        content_wrapper.appendChild(instructions);
        this.create_resize_element(boundary_box);
        content.appendChild(boundary_box);
        content_wrapper.appendChild(content);
        return boundary_box;
    };
    Resizer.prototype.create_resize_element = function (boundary_box) {
        this.aspect_ratio = this.init_width / this.init_height;
        var resize_element = document.createElement('div');
        resize_element.id = 'resize_element';
        var start_div_height = this.aspect_ratio < 1 ? this.init_resize_element : Math.round(this.init_resize_element / this.aspect_ratio); // aspect ratio < 1 means width < height
        var start_div_width = this.aspect_ratio < 1 ? Math.round(this.init_resize_element / this.aspect_ratio) : this.init_resize_element;
        var adjust_size = Math.round(start_div_width * 0.1);
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
    };
    Resizer.prototype.create_drag_element = function (resize_element, adjust_size) {
        var drag_element = document.createElement('div');
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
    };
    Resizer.prototype.create_btn = function (boundary_box) {
        var btn = document.createElement('button');
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
    };
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
    Resizer.prototype.resize_object = function (static_page) {
        var _this = this;
        var _a, _b;
        var dragging = false;
        var resize_element = document.querySelector('#resize_element');
        if (!resize_element) {
            throw new Error('Resize element not found');
        }
        ;
        var original_width = parseInt(resize_element.style.width);
        var origin_x;
        var dpi_text;
        var calculated_dpi = 0;
        document.addEventListener('mouseup', function () {
            dragging = false;
        });
        function mouse_down_event(e) {
            e.preventDefault();
            dragging = true;
            origin_x = e.pageX;
        }
        (_a = document.querySelector('#drag_element')) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', mouse_down_event);
        if (static_page) {
            dpi_text = document.createElement('div');
            dpi_text.id = 'dpi_text';
            dpi_text.style.marginTop = '10px';
            dpi_text.innerText = "DPI: ".concat(calculated_dpi.toFixed(2));
            document.body.appendChild(dpi_text);
        }
        document.addEventListener('mousemove', function (e) {
            e.preventDefault();
            if (!dragging) {
                return;
            }
            var dx = e.pageX - origin_x;
            var new_width = original_width + dx;
            var new_height = Math.round(new_width / _this.aspect_ratio);
            resize_element.style.width = new_width + 'px';
            resize_element.style.height = new_height + 'px';
            if (static_page) {
                var calculated_dpi_width = new_width / _this.init_width / 0.03937;
                var calculated_dpi_height = new_height / _this.init_height / 0.03937;
                calculated_dpi = (calculated_dpi_width + calculated_dpi_height) / 2;
                dpi_text.innerText = "DPI: ".concat(calculated_dpi);
            }
        });
        (_b = document.querySelector('#resize_btn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function (e) {
            e.preventDefault();
            var element_width = resize_element.getBoundingClientRect().width;
            _this.px2mm = element_width / _this.init_width;
            _this.calculated_dpi = _this.px2mm / 0.03937;
            var instructions = document.querySelector('#content-wrapper p');
            if (instructions) {
                instructions.remove();
            }
            if (_this.use_perceived_distance) {
                debugger;
                _this.start_blindspot_task();
            }
            else {
                _this.end_resizing_task();
            }
        });
    };
    /**
     * Initializes and starts the blind spot task. This function sets up the HTML content
     * for the task, including instructions and interactive elements. It also adds necessary
     * event listeners and prepares the visual elements for the task.
     *
     * @throws {Error} If the boundary box or SVG element is not found.
     */
    Resizer.prototype.start_blindspot_task = function () {
        var div = document.querySelector('#boundary_box');
        if (!div) {
            throw new Error('Test div not found');
        }
        var blindspot_content = "\n            <div id=\"blind-spot\">\n                <p>Now we will quickly measure how far away you are sitting.</p>\n                <div style=\"text-align: left\">\n                    <ol>\n                        <li>Put your left hand on the <b>space bar</b>.</li>\n                        <li>Cover your right eye with your right hand.</li>\n                        <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>\n                        <li>The <span style=\"color: red; font-weight: bold;\">red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>\n                    </ol>\n                </div>\n                <p>Press the space bar when you are ready to begin.</p>\n                <div id=\"svgDiv\" style=\"height:100px; position:relative;\"></div>\n                    <button class=\"btn btn-primary\" id=\"proceed\" style=\"display:none;\"> +\n                       Yes +\n                    </button>\n                remaining measurements:\n                <div id=\"click\" style=\"display:inline; color: red\"> ".concat(this.reps_remaining, " </div>\n            </div>");
        div.innerHTML = blindspot_content;
        var svg = document.querySelector('#svgDiv');
        if (!svg) {
            throw new Error('SVG element not found');
        }
        this.add_root_event_listeners();
        this.container = svg;
        this.container.innerHTML = "\n        <div id=\"virtual-chinrest-circle\" style=\"position: absolute; background-color: #f00; width: 30px; height: 30px; border-radius:30px;\"></div>\n        <div id=\"virtual-chinrest-square\" style=\"position: absolute; background-color: #000; width: 30px; height: 30px;\"></div>";
        var ball_div = this.container.querySelector("#virtual-chinrest-circle");
        if (!ball_div) {
            throw new Error('Virtual chinrest circle not found');
        }
        this.ball = ball_div;
        this.reset_ball_wait_for_start();
    };
    /**
     * Listens for keyboard responses and triggers a callback function when a valid response is detected.
     *
     * @param callback_function - The function to call when a valid response is detected. It receives an object containing the key pressed and the reaction time.
     * @param valid_responses - An array of valid key responses.
     * @param persist - If true, the listener will persist after a valid response is detected. Otherwise, it will be removed.
     * @param allow_held_keys - If true, allows responses from keys that are held down.
     * @param minimum_rt - The minimum reaction time (in milliseconds) required for a response to be considered valid.
     */
    Resizer.prototype.get_keyboard_response = function (callback_function, valid_responses, persist, allow_held_keys, minimum_rt) {
        var _this = this;
        var start_time = performance.now();
        var listener = function (e) {
            e.preventDefault();
            if (_this.check_valid_response(valid_responses, allow_held_keys, e.key)) {
                var rt = performance.now() - start_time;
                if (rt < minimum_rt) {
                    return;
                }
                if (!persist) {
                    var index = _this.listeners.indexOf(listener);
                    if (index > -1) {
                        _this.listeners.splice(index, 1);
                    }
                }
                callback_function({ key: e.key, rt: rt });
            }
        };
        this.listeners.push(listener);
    };
    /**
     * Initiates the ball animation and sets up a keyboard response listener.
     *
     * This method performs the following actions:
     * 1. Sets up a keyboard response listener that triggers the `record_position` method when the spacebar (' ') is pressed.
     * 2. Starts the ball animation by calling `requestAnimationFrame` with the `animate_ball` method.
     *
     * @returns {void}
     */
    Resizer.prototype.start_ball = function () {
        this.get_keyboard_response(this.record_position.bind(this), [' '], false, false, 0);
        this.ball_animation_frame_id = requestAnimationFrame(this.animate_ball.bind(this));
    };
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
    Resizer.prototype.record_position = function () {
        cancelAnimationFrame(this.ball_animation_frame_id);
        var x = this.accurate_round(this.getElementCenter(this.ball).x, 2);
        this.blindspot_data.ball_pos.push(x);
        this.reps_remaining--;
        document.querySelector("#click").textContent = Math.max(this.reps_remaining, 0).toString();
        if (this.reps_remaining <= 0) {
            this.finalize_blindspot_task();
        }
        else {
            this.reset_ball_wait_for_start();
        }
    };
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
    Resizer.prototype.finalize_blindspot_task = function () {
        var angle = 13.5;
        var sum = this.blindspot_data.ball_pos.reduce(function (a, b) { return a + b; }, 0);
        var avg = this.accurate_round(sum / this.blindspot_data.ball_pos.length, 2);
        this.blindspot_data.avg_ball_pos = avg;
        var ball_square_distance = (this.blindspot_data['square_pos'] - avg) / this.px2mm;
        this.view_distance = ball_square_distance / Math.tan((angle * Math.PI) / 180);
        this.scaling_factor = this.view_distance / this.development_distance;
        this.remove_root_event_listeners();
        this.end_resizing_task();
    };
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
    Resizer.prototype.end_resizing_task = function () {
        var div = document.querySelector('#content');
        if (!div) {
            throw new Error('Test div not found');
        }
        div.style.display = 'none';
        var canvas = document.getElementsByTagName('canvas')[0];
        if (!canvas) {
            throw new Error('Canvas not found');
        }
        var canvas_aspect_ratio = canvas.width / canvas.height;
        var new_width, new_height;
        if (this.scaling_factor == undefined) {
            var pixel_width = Math.round(this.canvas_width_in_mm * this.calculated_dpi / 25.4);
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
        canvas.style.width = "".concat(new_width, "px");
        canvas.style.height = "".concat(new_height, "px");
        document.body.getElementsByTagName('main')[0].style.display = 'flex';
        this.runner._experiment.vars.set('squeeze', this.squeeze);
        this.runner._experiment.vars.set('view_distance', this.view_distance);
        this.runner._experiment.vars.set('scaling_factor', this.scaling_factor);
        this.runner._experiment.vars.set('calculated_dpi', this.calculated_dpi);
        this.runner._experiment.vars.set('px2mm', this.px2mm);
        this.complete = true;
    };
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
    Resizer.prototype.reset_ball_wait_for_start = function () {
        var rectX = this.container.getBoundingClientRect().width - 30;
        var ballX = rectX * 0.85; // define where the ball is
        var square = this.container.querySelector("#virtual-chinrest-square");
        if (!square) {
            throw new Error('Virtual chinrest square not found');
        }
        this.ball.style.left = "".concat(ballX, "px");
        square.style.left = "".concat(rectX, "px");
        this.blindspot_data["square_pos"] = this.accurate_round(this.getElementCenter(square).x, 2);
        this.get_keyboard_response(this.start_ball.bind(this), [' '], false, false, 0);
    };
    Resizer.prototype.animate_ball = function () {
        var dx = -2;
        var x = parseInt(this.ball.style.left);
        this.ball.style.left = "".concat(x + dx, "px");
        this.ball_animation_frame_id = requestAnimationFrame(this.animate_ball.bind(this));
    };
    Resizer.prototype.add_root_event_listeners = function () {
        var _this = this;
        document.body.addEventListener('keydown', function (e) {
            for (var _i = 0, _a = __spreadArray([], _this.listeners, true); _i < _a.length; _i++) {
                var listener = _a[_i];
                try {
                    listener(e);
                }
                catch (error) {
                    console.error(error);
                }
            }
            _this.held_keys.add(e.key);
        });
        document.body.addEventListener('keyup', function (e) {
            _this.held_keys.delete(e.key);
        });
    };
    Resizer.prototype.check_valid_response = function (valid_responses, allow_held_keys, key) {
        if (allow_held_keys === void 0) { allow_held_keys = false; }
        if (!allow_held_keys && this.held_keys.has(key)) {
            return false;
        }
        if (valid_responses.includes(key)) {
            return true;
        }
        return false;
    };
    Resizer.prototype.getElementCenter = function (el) {
        var box = el.getBoundingClientRect();
        return {
            x: box.left + box.width / 2,
            y: box.top + box.height / 2,
        };
    };
    Resizer.prototype.remove_root_event_listeners = function () {
        var _this = this;
        this.listeners = [];
        document.body.removeEventListener('keydown', function (e) {
            _this.held_keys.delete(e.key);
        });
        document.body.removeEventListener('keyup', function (e) {
            for (var _i = 0, _a = __spreadArray([], _this.listeners, true); _i < _a.length; _i++) {
                var listener = _a[_i];
                try {
                    listener(e);
                }
                catch (error) {
                    console.error(error);
                }
            }
            _this.held_keys.add(e.key);
        });
    };
    Resizer.prototype.accurate_round = function (value, decimals) {
        return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
    };
    return Resizer;
}());
