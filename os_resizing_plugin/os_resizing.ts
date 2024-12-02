class Resizer {
    init_height: number = 53.98; // card height in mm
    init_width: number = 85.6; // card width in mm
    init_resize_element: number = 250; // resize element in px
    aspect_ratio: number;
    px2mm: number;


    constructor() {
        this.test_div();
        this.force_canvas_size();
        this.create_resize_element();
        this.create_btn();
        this.resize_object();
    }

    test_div() { // TODO: make sure this div is on top of the canvas, not below
        var test = document.createElement('div');
        test.id = 'test';
        test.textContent = 'test';
        test.style.position = 'relative';
        test.style.top = '0';
        test.style.left = '0';
        test.style.right = '0';
        test.style.bottom = '0';
        document.getElementsByTagName('main')[0].appendChild(test);
    }

    force_canvas_size() {
        let test = document.getElementById('test');
        if (test) {
            let canvas = document.getElementsByTagName('canvas')[0];
            test.style.width = canvas.clientWidth + 'px';
            test.style.height = canvas.clientHeight + 'px';
        }
    }

    create_resize_element() { // TODO: fix the positioning of the resize element
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
        resize_element.style.margin = '5px'
        resize_element.style.background = '#006600';
        resize_element.style.cursor = 'nwse-resize';
        let test = document.getElementById('test');
        this.create_drag_element(resize_element, adjust_size);
        test?.appendChild(resize_element);
    }

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

    create_btn() {
        let btn = document.createElement('button');
        btn.id = 'resize_btn';
        btn.textContent = 'Resize';
        let test = document.getElementById('test');
        test?.appendChild(btn);
    }

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
                console.log('dragging');
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
            console.log('clicked');
            if (resize_element) {
                const element_width = resize_element.getBoundingClientRect().width;
                this.px2mm = this.init_width / element_width;
                console.log('px2mm: ' + this.px2mm);
            }
        });
    }
}

