"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var Resizer = /** @class */ (function () {
    function Resizer(runner) {
        this.init_height = 53.98;
        this.init_width = 85.6;
        this.init_resize_element = 250;
        this.reps_remaining = 5;
        this.blindspot_data = {
            ball_pos: [],
            avg_ball_pos: 0,
            square_pos: 0,
        };
        this.runner = runner;
        this.test_div();
        this.resize_object();
    }
    /**
     * Creates and styles a test div element, and appends it to the canvas parent.
     * @returns {void}
     */
    Resizer.prototype.test_div = function () {
        var test = document.createElement('div');
        test.id = 'test';
        test.textContent = 'test';
        set_div_style();
        var canvas = document.getElementsByTagName('canvas')[0];
        this.force_canvas_size(test, canvas);
        this.create_resize_element(test);
        this.create_btn(test);
        var parent = canvas.parentElement;
        parent === null || parent === void 0 ? void 0 : parent.appendChild(test);
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
    };
    /**
     * This function forces the test div element to match the canvas size.
     * @param test div element that contains the resize element
     * @param canvas the canvas element created by OSWeb that contains the correct dimensions
     */
    Resizer.prototype.force_canvas_size = function (test, canvas) {
        if (test) {
            test.style.maxWidth = canvas.clientWidth + 'px';
            test.style.maxHeight = canvas.clientHeight + 'px';
            test.style.width = canvas.clientWidth + 'px';
            test.style.height = canvas.clientHeight + 'px';
            canvas.style.display = 'none';
        }
    };
    /**
     * Creates the resizing element and appends it to the test div.
     * @param test test div element that will contain the resize element
     */
    Resizer.prototype.create_resize_element = function (test) {
        this.aspect_ratio = this.init_width / this.init_height;
        var resize_element = document.createElement('div');
        resize_element.id = 'resize_element';
        resize_element.style.position = 'relative';
        var start_div_height = this.aspect_ratio < 1 ? this.init_resize_element : Math.round(this.init_resize_element / this.aspect_ratio); // aspect ratio < 1 means width < height
        var start_div_width = this.aspect_ratio < 1 ? Math.round(this.init_resize_element / this.aspect_ratio) : this.init_resize_element;
        var adjust_size = Math.round(start_div_width * 0.1);
        resize_element.style.height = start_div_height + 'px';
        resize_element.style.width = start_div_width + 'px';
        resize_element.style.background = '#006600';
        resize_element.style.cursor = 'nwse-resize';
        this.create_drag_element(resize_element, adjust_size);
        test.appendChild(resize_element);
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
        drag_element.style.bottom = '0';
        drag_element.style.right = '0';
        drag_element.style.width = adjust_size + 'px';
        drag_element.style.height = adjust_size + 'px';
        drag_element.style.background = 'blue';
        drag_element.style.cursor = 'move';
        resize_element.appendChild(drag_element);
    };
    /**
     * Creates a button to trigger the resize and appends it to the test div.
     * @param test test div element that contains the resize element
     */
    Resizer.prototype.create_btn = function (test) {
        var btn = document.createElement('button');
        btn.id = 'resize_btn';
        btn.textContent = 'Resize';
        btn.style.position = 'relative';
        btn.style.bottom = '0';
        test.appendChild(btn);
    };
    /**
     * Handles the resizing logic and updates the canvas size based on the resize element.
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
            _this.px2mm = _this.init_width / element_width;
            _this.start_blindspot_task();
        });
    };
    Resizer.prototype.start_blindspot_task = function () {
        var div = document.querySelector('#test');
        if (!div) {
            throw new Error('Test div not found');
        }
        var blindspot_content = "\n            <div id=\"blind-spot\">\n                <p>Now we will quickly measure how far away you are sitting.</p>\n                <div style=\"text-align: left\">\n                    <ol>\n                        <li>Put your left hand on the <b>space bar</b>.</li>\n                        <li>Cover your right eye with your right hand.</li>\n                        <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>\n                        <li>The <span style=\"color: red; font-weight: bold;\">red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>\n                    </ol>\n                </div>\n                <p>Press the space bar when you are ready to begin.</p>\n                <div id=\"svgDiv\" style=\"height:100px; position:relative;\"></div>\n                    <button class=\"btn btn-primary\" id=\"proceed\" style=\"display:none;\"> +\n                       Yes +\n                    </button>\n                remaining measurements:\n                <div id=\"click\" style=\"display:inline; color: red\"> ".concat(this.reps_remaining, " </div>\n            </div>");
        div.innerHTML = blindspot_content;
        var svg = document.querySelector('#svgDiv');
        if (!svg) {
            throw new Error('SVG element not found');
        }
        this.container = svg;
        this.container.innerHTML = "\n        <div id=\"virtual-chinrest-circle\" style=\"position: absolute; background-color: #f00; width: 30px; height: 30px; border-radius:30px;\"></div>\n        <div id=\"virtual-chinrest-square\" style=\"position: absolute; background-color: #000; width: 30px; height: 30px;\"></div>";
        this.reset_ball_wait_for_start();
    };
    Resizer.prototype.start_ball = function () {
        var _this = this;
        this.container.addEventListener('keydown', function (e) {
            if (e.key === ' ') {
                _this.record_position();
            }
        });
        this.ball_animation_frame_id = requestAnimationFrame(this.animate_ball);
    };
    Resizer.prototype.record_position = function () {
        cancelAnimationFrame(this.ball_animation_frame_id);
        var x = parseInt(this.ball.style.left);
        this.blindspot_data.ball_pos.push(x);
        this.reps_remaining--;
        if (this.reps_remaining <= 0) {
            console.log('pass');
        }
        else {
            this.reset_ball_wait_for_start();
        }
    };
    Resizer.prototype.reset_ball_wait_for_start = function () {
        var _this = this;
        var ball_div = this.container.querySelector("#virtual-chinrest-circle");
        if (!ball_div) {
            throw new Error('Virtual chinrest circle not found');
        }
        var square = this.container.querySelector("#virtual-chinrest-square");
        if (!square) {
            throw new Error('Virtual chinrest square not found');
        }
        var rectX = this.container.getBoundingClientRect().width - 30;
        var ballX = rectX * 0.85; // define where the ball is
        ball_div.style.left = "".concat(ballX, "px");
        square.style.left = "".concat(rectX, "px");
        this.ball = ball_div;
        this.container.addEventListener('keydown', function (e) {
            if (e.key === ' ') {
                _this.start_ball();
            }
        });
    };
    Resizer.prototype.animate_ball = function () {
        var dx = -2;
        var x = parseInt(this.ball.style.left);
        this.ball.style.left = "".concat(x + dx, "px");
        this.ball_animation_frame_id = requestAnimationFrame(this.animate_ball);
    };
    return Resizer;
}());
