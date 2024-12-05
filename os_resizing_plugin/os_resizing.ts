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
    init_height: number = 53.98; // card height in mm
    init_width: number = 85.6; // card width in mm
    init_resize_element: number = 250; // resize element in px
    aspect_ratio: number;
    px2mm: number;


    constructor() {
        this.test_div();
        this.resize_object();
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
            test.style.width = '100%';
            test.style.height = '100%';
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
            canvas.style.display = 'none';
        }
    }

    /**
     * Creates the resizing element and appends it to the test div.
     * @param test test div element that will contain the resize element
     */
    create_resize_element(test: HTMLElement): void { // TODO: fix the positioning of the resize element
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
        let dragging = false;
        let resize_element = document.querySelector<HTMLElement>('#resize_element');
        let origin_x, origin_y;
        let cx, cy;

        document.addEventListener('mouseup', () => {
            dragging = false;
        })

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

        document.querySelector('#drag_element')?.addEventListener('mousedown', mouse_down_event);

        document.addEventListener('mousemove', (e) => {
            if (dragging) {
                let dx = e.pageX - origin_x;
                let dy = e.pageY - origin_y;
                if (resize_element && Math.abs(dx) >= Math.abs(dy)) {
                    let new_width = Math.round(Math.max(20, cx + dx*2));
                    let new_height = Math.round(Math.max(20, cy + dy*2) / this.aspect_ratio);
                    resize_element.style.width = new_width + 'px';
                    resize_element.style.height = new_height + 'px';
                } else if (resize_element) {
                    let new_width = Math.round(this.aspect_ratio * Math.max(20, cx + dx*2));
                    let new_height = Math.round(Math.max(20, cy + dy*2));
                    resize_element.style.width = new_width + 'px';
                    resize_element.style.height = new_height + 'px';
                }
            }
        });

        document.querySelector('#resize_btn')?.addEventListener('click', () => { // make sure this gets executed before the canvases are loaded. Maybe a different block in OS?
            if (resize_element) {
                let element_width = resize_element.getBoundingClientRect().width;
                this.px2mm = this.init_width / element_width;
                let canvas = document.getElementsByTagName('canvas')[0];
                canvas.style.display = 'inline-block';
                let test = document.getElementById('test');
                if (!test) return;
                test.style.display = 'none';
            }
        });
    }
}

