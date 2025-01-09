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
var Resizer = /** @class */ (function () {
    function Resizer(runner, developed_distance) {
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
        this.developed_distance = developed_distance;
        this.runner = runner;
        var content_wrapper = this.create_content_wrapper();
        this.content_div(content_wrapper);
        this.resize_object();
        this.get_keyboard_response = this.get_keyboard_response.bind(this);
    }
    /**
     * Creates and styles a content wrapper div element, and appends it to the body.
     * @returns {HTMLElement} The content wrapper div element.
     */
    Resizer.prototype.create_content_wrapper = function () {
        var content_wrapper = document.createElement('div');
        content_wrapper.id = 'content-wrapper';
        content_wrapper.style.display = 'flex';
        content_wrapper.style.flexDirection = 'column';
        content_wrapper.style.margin = 'auto';
        content_wrapper.style.width = '100%';
        content_wrapper.style.flex = '1 1 100%';
        content_wrapper.style.overflowY = 'auto';
        document.body.appendChild(content_wrapper);
        return content_wrapper;
    };
    /**
     * Creates and styles a content div element, and appends it to the canvas parent.
     * @returns {void}
     */
    Resizer.prototype.content_div = function (content_wrapper) {
        var content = document.createElement('div');
        content.id = 'content';
        content.style.textAlign = 'center';
        content.style.margin = 'auto';
        document.body.getElementsByTagName('main')[0].style.display = 'none';
        var insert_name = document.createElement('div');
        insert_name.id = 'insert_name';
        insert_name.style.width = '900px';
        insert_name.style.margin = '0 auto';
        this.create_resize_element(insert_name);
        this.create_btn(insert_name);
        content.appendChild(insert_name);
        content_wrapper.appendChild(content);
    };
    /**
     * Creates the resizing element and appends it to the content div.
     * @param content content div element that will contain the resize element
     */
    Resizer.prototype.create_resize_element = function (insert_name) {
        var page_size = document.createElement('div');
        page_size.id = 'page_size';
        insert_name.appendChild(page_size);
        this.aspect_ratio = this.init_width / this.init_height;
        var resize_element = document.createElement('div');
        resize_element.id = 'resize_element';
        var start_div_height = this.aspect_ratio < 1 ? this.init_resize_element : Math.round(this.init_resize_element / this.aspect_ratio); // aspect ratio < 1 means width < height
        var start_div_width = this.aspect_ratio < 1 ? Math.round(this.init_resize_element / this.aspect_ratio) : this.init_resize_element;
        var adjust_size = Math.round(start_div_width * 0.1);
        resize_element.style.border = 'none';
        resize_element.style.height = start_div_height + 'px';
        resize_element.style.width = start_div_width + 'px';
        resize_element.style.margin = '5px auto';
        resize_element.style.background = '#006600';
        resize_element.style.position = 'relative';
        this.create_drag_element(resize_element, adjust_size);
        page_size.appendChild(resize_element);
    };
    /**
     * Creates a draggable element for resizing and appends it to the resize element.
     * @param resize_element Resize element that will contain the drag element
     * @param adjust_size The size of the drag element in pixels
     */
    Resizer.prototype.create_drag_element = function (resize_element, adjust_size) {
        var drag_element = document.createElement('div');
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
    };
    /**
     * Creates a button to trigger the resize and appends it to the content div.
     * @param content content div element that contains the resize element
     */
    Resizer.prototype.create_btn = function (insert_name) {
        var btn = document.createElement('button');
        btn.id = 'resize_btn';
        btn.textContent = 'Resize';
        btn.style.display = 'inline-block';
        btn.style.margin = '0.75em';
        btn.style.textAlign = 'center';
        btn.style.verticalAlign = 'middle';
        btn.style.position = 'relative';
        btn.style.bottom = '0';
        insert_name.appendChild(btn);
    };
    /**
     * Handles the resizing logic and updates the canvas size based on the resize element.
     * @returns {void}
     * @throws {Error} Resize element not found
     */
    Resizer.prototype.resize_object = function () {
        var _this = this;
        var _a, _b;
        this._complete_function_cache = this.runner._events._currentItem._complete; // cache the complete function
        this.runner._events._currentItem._complete = function () { }; // override the complete function
        var dragging = false;
        var resize_element = document.querySelector('#resize_element');
        if (!resize_element) {
            throw new Error('Resize element not found');
        }
        ;
        var original_height = parseInt(resize_element.style.height);
        var original_width = parseInt(resize_element.style.width);
        var origin_x, origin_y;
        document.addEventListener('mouseup', function () {
            dragging = false;
        });
        function mouse_down_event(e) {
            e.preventDefault();
            dragging = true;
            origin_x = e.pageX;
            origin_y = e.pageY;
        }
        (_a = document.querySelector('#drag_element')) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', mouse_down_event);
        document.addEventListener('mousemove', function (e) {
            if (dragging) {
                var dx = e.pageX - origin_x;
                var dy = e.pageY - origin_y;
                var new_width = original_width + dx;
                var new_height = original_height + dy;
                resize_element.style.width = new_width + 'px';
                resize_element.style.height = Math.round(new_height / _this.aspect_ratio) + 'px';
            }
        });
        (_b = document.querySelector('#resize_btn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
            var element_width = resize_element.getBoundingClientRect().width;
            _this.px2mm = element_width / _this.init_width;
            _this.start_blindspot_task();
        });
    };
    /**
     * Starts the blindspot task.
     */
    Resizer.prototype.start_blindspot_task = function () {
        var div = document.querySelector('#insert_name');
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
     * Get a keyboard response.
     * @param callback_function function to be triggered on response
     * @param valid_responses array of valid responses
     * @param persist whether to keep the listener after a valid response
     * @param allow_held_keys allow held keys
     * @param minimum_rt set a minimum response time
     */
    Resizer.prototype.get_keyboard_response = function (callback_function, valid_responses, persist, allow_held_keys, minimum_rt) {
        var _this = this;
        var start_time = performance.now();
        var listener = function (e) {
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
                console.log('response', e.key, rt);
                console.log('function', callback_function);
                callback_function({ key: e.key, rt: rt });
            }
        };
        this.listeners.push(listener);
    };
    /**
     * Start the ball animation.
     */
    Resizer.prototype.start_ball = function () {
        this.get_keyboard_response(this.record_position.bind(this), [' '], false, false, 0);
        this.ball_animation_frame_id = requestAnimationFrame(this.animate_ball.bind(this));
    };
    /**
     * Record the ball position.
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
     * Finalize the blindspot task.
     */
    Resizer.prototype.finalize_blindspot_task = function () {
        var angle = 13.5;
        var sum = this.blindspot_data.ball_pos.reduce(function (a, b) { return a + b; }, 0);
        var avg = this.accurate_round(sum / this.blindspot_data.ball_pos.length, 2);
        this.blindspot_data.avg_ball_pos = avg;
        var ball_square_distance = (this.blindspot_data['square_pos'] - avg) / this.px2mm;
        this.view_distance = ball_square_distance / Math.tan((angle * Math.PI) / 180);
        this.scale_factor = this.view_distance / this.developed_distance;
        this.remove_root_event_listeners();
        var div = document.querySelector('#content');
        if (!div) {
            throw new Error('Test div not found');
        }
        div.style.display = 'none';
        var canvas = document.getElementsByTagName('canvas')[0];
        var new_width = Math.round(this.runner._experiment.vars.get('width') * this.scale_factor);
        var new_height = Math.round(this.runner._experiment.vars.get('height') * this.scale_factor);
        this.runner._experiment.vars.set('width', new_width);
        this.runner._experiment.vars.set('height', new_height);
        this.runner._renderer.resize(new_width, new_height);
        canvas.style.display = 'inline-block';
        document.body.getElementsByTagName('main')[0].style.display = 'flex';
        this.runner._events._currentItem._complete = this._complete_function_cache;
        this.runner._events._currentItem._complete();
    };
    /**
     * Reset the ball and wait for the start.
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
    /**
     * adds event listeners to the root element, which allow the keyboard responses to trigger functions.
     */
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
    /**
     * Check if a response is valid.
     * @param valid_responses array of valid responses
     * @param allow_held_keys allow held keys
     * @param key key to check
     * @returns boolean
     */
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
    /**
     * Get the center of an element.
     * @param el element
     * @returns object with x and y coordinates
     */
    Resizer.prototype.getElementCenter = function (el) {
        var box = el.getBoundingClientRect();
        return {
            x: box.left + box.width / 2,
            y: box.top + box.height / 2,
        };
    };
    /**
     * removes the event listeners from the root element, which allow the keyboard responses to trigger functions.
     */
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
    /**
     * Rounds a number to a specified number of decimal places.
     * @param value number to round
     * @param decimals number of decimal places
     * @returns rounded number
     */
    Resizer.prototype.accurate_round = function (value, decimals) {
        return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
    };
    return Resizer;
}());
