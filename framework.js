export let canvas;
export let context;
let mousePos = { x: 0, y: 0 };
let mouseDown = false;
export function createCanvas(options) {
    options = options ?? {};
    if (options.selector) {
        canvas = document.querySelector(options.selector);
    }
    else {
        canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.append(canvas);
    }
    context = canvas.getContext("2d");
    canvas.addEventListener("mousemove", (e) => {
        let d = {
            x: e.offsetX - mousePos.x,
            y: e.offsetY - mousePos.y
        };
        let p = { x: e.offsetX, y: e.offsetY };
        if (options.onMouseMove) {
            options.onMouseMove(p, d);
        }
        if (mouseDown && options.onMouseDrag) {
            options.onMouseDrag(p, d);
        }
        mousePos.x = e.offsetX;
        mousePos.y = e.offsetY;
    });
    canvas.addEventListener("mousedown", () => {
        if (options.onMouseDown)
            options.onMouseDown({ x: mousePos.x, y: mousePos.y });
        mouseDown = true;
    });
    window.addEventListener("mouseup", () => {
        if (options.onMouseUp)
            options.onMouseUp({ x: mousePos.x, y: mousePos.y });
        mouseDown = false;
    });
    window.addEventListener("resize", (e) => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (options.onResize)
            options.onResize();
    });
    return [canvas, context];
}
export function line(x0, y0, x1, y1) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();
}
export function circle(x, y, r) {
    context.beginPath();
    context.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
    context.stroke();
    context.closePath();
}
export function triangle(x0, y0, x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x0, y0);
    context.stroke();
    context.closePath();
}
export function arrow(x0, y0, l, r, ratio = 6) {
    let cos = Math.cos(r);
    let sin = Math.sin(r);
    let headSize = l / ratio;
    let arrowWidth = l / 100;
    context.beginPath();
    context.moveTo(x0 + cos * l, y0 + sin * l); // Tip
    context.lineTo(x0 + cos * (l - 2 * headSize) + sin * headSize, y0 - cos * headSize + sin * (l - 2 * headSize)); // Top
    context.lineTo(x0 + cos * (l - 2 * headSize) + sin * arrowWidth, y0 - cos * arrowWidth + sin * (l - 2 * headSize)); // Top mid
    context.lineTo(x0 + sin * arrowWidth, y0 - cos * arrowWidth); // back top
    context.lineTo(x0 - sin * arrowWidth, y0 + cos * arrowWidth); // back bottom
    context.lineTo(x0 + cos * (l - 2 * headSize) - sin * arrowWidth, y0 + cos * arrowWidth + sin * (l - 2 * headSize)); // Bottom mid
    context.lineTo(x0 + cos * (l - 2 * headSize) - sin * headSize, y0 + cos * headSize + sin * (l - 2 * headSize)); // Bottom
    context.lineTo(x0 + cos * l, y0 + sin * l); // Tip
    context.closePath();
}
export function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}
//# sourceMappingURL=framework.js.map