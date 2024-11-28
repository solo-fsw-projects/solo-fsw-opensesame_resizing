class Resizer {
    init_height: number = 53.98; // card height in mm
    init_width: number = 85.6; // card width in mm
    init_resize_element: number = 250; // resize element in px
    constructor() {}

    test() {
        var test = document.createElement('div');
        test.id = 'test';
        test.textContent = 'test';
        test.style.position = 'absolute';
        test.style.top = '0';
        var canvas = document.getElementById('canvas');
        var parent = canvas ? canvas.parentElement : null;
        if (parent) {
            parent.appendChild(test);
        }
    }

    force_canvas_size() {
        // get the canvas
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        // get the canvas's parent
        let parent = canvas.parentElement;
        // set test div to canvas's parent's width and height
        let test = document.getElementById('test');
        if (test && parent) {
            test.style.width = parent.clientWidth + 'px';
            test.style.height = parent.clientHeight + 'px';
        }
    }

    create_resize_element() {
        let aspect_ratio = this.init_width / this.init_height;
        let resize_element = document.createElement('div');
        resize_element.id = 'resize_element';
        resize_element.style.position = 'relative';
        resize_element.style.width = 
            aspect_ratio < 1 ? this.init_resize_element + 'px' : Math.round(this.init_resize_element / aspect_ratio) + 'px'; // aspect ratio < 1 means width < height
        resize_element.style.height = 
            aspect_ratio < 1 ? Math.round(this.init_resize_element / aspect_ratio) + 'px' : this.init_resize_element + 'px';
        resize_element.style.background = 'red';
        resize_element.style.cursor = 'nwse-resize';
        let canvas = document.getElementsByTagName('canvas')[0];
        let parent = canvas ? canvas.parentElement : null;
        if (parent) {
            parent.appendChild(resize_element);
        }
    }


}

