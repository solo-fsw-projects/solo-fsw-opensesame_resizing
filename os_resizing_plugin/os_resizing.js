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
    function Resizer() {
        this.init_height = 53.98; // card height in mm
        this.init_width = 85.6; // card width in mm
        this.init_resize_element = 250; // resize element in px
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
            test.style.width = '100%';
            test.style.height = '100%';
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
    Resizer.prototype.create_btn = function (test) {
        var btn = document.createElement('button');
        btn.id = 'resize_btn';
        btn.textContent = 'Resize';
        btn.style.position = 'relative';
        btn.style.bottom = '0';
        test.appendChild(btn);
    };
    Resizer.prototype.resize_object = function () {
        var _this = this;
        var _a, _b;
        var dragging = false;
        var resize_element = document.querySelector('#resize_element');
        var origin_x, origin_y;
        var cx, cy;
        document.addEventListener('mouseup', function () {
            dragging = false;
        });
        function mouse_down_event(e) {
            dragging = true;
            console.log('mouse down');
            origin_x = e.pageX;
            origin_y = e.pageY;
            if (resize_element) {
                cx = parseInt(resize_element.style.width);
                cy = parseInt(resize_element.style.height);
            }
        }
        (_a = document.querySelector('#drag_element')) === null || _a === void 0 ? void 0 : _a.addEventListener('mousedown', mouse_down_event);
        document.addEventListener('mousemove', function (e) {
            if (dragging) {
                var dx = e.pageX - origin_x;
                var dy = e.pageY - origin_y;
                if (resize_element && Math.abs(dx) >= Math.abs(dy)) {
                    var new_width = Math.round(Math.max(20, cx + dx * 2));
                    var new_height = Math.round(Math.max(20, cy + dy * 2) / _this.aspect_ratio);
                    resize_element.style.width = new_width + 'px';
                    resize_element.style.height = new_height + 'px';
                }
                else if (resize_element) {
                    var new_width = Math.round(_this.aspect_ratio * Math.max(20, cx + dx * 2));
                    var new_height = Math.round(Math.max(20, cy + dy * 2));
                    resize_element.style.width = new_width + 'px';
                    resize_element.style.height = new_height + 'px';
                }
            }
        });
        (_b = document.querySelector('#resize_btn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
            if (resize_element) {
                var element_width = resize_element.getBoundingClientRect().width;
                _this.px2mm = _this.init_width / element_width;
                var canvas = document.getElementsByTagName('canvas')[0];
                canvas.style.display = 'inline-block';
                var test = document.getElementById('test');
                if (!test)
                    return;
                test.style.display = 'none';
            }
        });
    };
    return Resizer;
}());
