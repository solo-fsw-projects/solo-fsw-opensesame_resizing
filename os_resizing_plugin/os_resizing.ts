
class Resizer {
    constructor() {
        this.test();
    }

    private test() {
        console.log('Hello World');
        // create a div with id 'test' that also displays 'Hello World'
        let test = document.createElement('div');
        test.id = 'test';
        test.innerHTML = 'Hello World';
        document.body.appendChild(test);
    }
}

