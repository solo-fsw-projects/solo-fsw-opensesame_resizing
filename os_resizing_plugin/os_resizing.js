var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Resizer = /** @class */ (function () {
    function Resizer(osweb, runner, use_perceived_distance, development_dpi, development_distance) {
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
        this.armed = false;
        if (!osweb) {
            this.static_page_main();
            return;
        }
        this.development_dpi = development_dpi;
        this.development_distance = development_distance;
        this.use_perceived_distance = use_perceived_distance;
        this.runner = runner;
        this.osweb_main();
        this.runner._events._currentItem._complete();
    }
    Resizer.prototype.static_page_main = function () {
        var content_wrapper = this.create_content_wrapper();
        this.content_div(content_wrapper);
        this.resize_object(true);
    };
    Resizer.prototype.osweb_main = function () {
        this.cache_runner();
        document.body.getElementsByTagName('main')[0].style.display = 'none';
        var content_wrapper = this.create_content_wrapper();
        var box = this.content_div(content_wrapper);
        this.create_btn(box);
        this.resize_object(false);
        this.get_keyboard_response = this.get_keyboard_response.bind(this);
    };
    Resizer.prototype.cache_runner = function () {
        var _this = this;
        this._complete_function_cache = this.runner._events._currentItem._complete; // cache the complete function
        this.runner._events._currentItem._complete = function () {
            if (_this.armed) {
                _this.armed = false;
                debugger;
                _this.runner._events._currentItem._complete = _this._complete_function_cache;
                _this.runner._events._currentItem._complete();
            }
        };
    };
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
    Resizer.prototype.start_ball = function () {
        this.get_keyboard_response(this.record_position.bind(this), [' '], false, false, 0);
        this.ball_animation_frame_id = requestAnimationFrame(this.animate_ball.bind(this));
    };
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
        var new_width, new_height;
        if (this.scaling_factor == undefined) {
            // this.scaling_factor = this.calculated_dpi / this.development_dpi;
            // scaling works well when going from high to low dpi, but not the other way around
            // reversing does not work, need to find different way to find proper scaling.
            // maybe use the pixel millimeter ratio to rescale the screen to real world sizes
            // const ctx = canvas.getContext('2d');
            // if (!ctx) throw new Error('Canvas context not found');
            var device_pixel_ratio = window.devicePixelRatio || 1;
            var screen_width_inches = screen.width / device_pixel_ratio;
            var reference_screen_inches = 13.3;
            this.scaling_factor = reference_screen_inches / screen_width_inches;
            new_width = Math.round(this.runner._experiment.vars.get('width') * this.scaling_factor * device_pixel_ratio);
            new_height = Math.round(this.runner._experiment.vars.get('height') * this.scaling_factor * device_pixel_ratio);
        }
        else {
            new_width = Math.round(this.runner._experiment.vars.get('width') * this.scaling_factor);
            new_height = Math.round(this.runner._experiment.vars.get('height') * this.scaling_factor);
        }
        // this.runner._events._currentItem._complete = this._complete_function_cache;
        var squeeze = new_width / screen.availWidth;
        if (new_height > screen.availHeight || new_width > screen.availWidth) {
            new_height = screen.availHeight;
            new_width = new_height * this.aspect_ratio;
        }
        canvas.width = new_width;
        canvas.height = new_height;
        canvas.style.width = "".concat(new_width, "px");
        canvas.style.height = "".concat(new_height, "px");
        document.body.getElementsByTagName('main')[0].style.display = 'flex';
        this.armed = true;
        this.runner._events._currentItem._complete();
    };
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
