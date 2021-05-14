import { createCanvas, canvas, context, circle, line } from "../framework.js";
class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }
    draw() {
        circle(this.x, this.y, this.r);
    }
    contains(point) {
        const xDiff = point.x - this.x;
        const yDiff = point.y - this.y;
        const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        return dist <= this.r;
    }
    onDrag(diff) {
        this.x += diff.x;
        this.y += diff.y;
    }
}
class BezierCenter extends Circle {
    onDrag(diff) {
        this.x += diff.x;
        this.y += diff.y;
        this.a.x += diff.x;
        this.a.y += diff.y;
        this.b.x += diff.x;
        this.b.y += diff.y;
    }
}
class BezierPoint extends Circle {
    draw() {
        circle(this.x, this.y, this.r);
        line(this.x, this.y, this.other.x, this.other.y);
    }
    onDrag(diff) {
        this.x += diff.x;
        this.y += diff.y;
        this.other.x -= diff.x;
        this.other.y -= diff.y;
    }
}
function createBezierPoint(p) {
    const center = new BezierCenter(p.x, p.y, 20);
    const a = new BezierPoint(p.x + 100, p.y + 100, 10);
    const b = new BezierPoint(p.x - 100, p.y - 100, 10);
    center.a = a;
    center.b = b;
    a.center = center;
    b.center = center;
    a.other = b;
    b.other = a;
    return { center, a, b };
}
function bezierInterpol(t, p0, p1, p2, p3) {
    return {
        x: Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * t * t * p2.x + Math.pow(t, 3) * p3.x,
        y: Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * t * t * p2.y + Math.pow(t, 3) * p3.y
    };
}
createCanvas({
    onMouseMove: mouseMoved,
    onMouseDrag: mouseDragged,
    onMouseDown: mousePressed,
    onMouseUp: mouseReleased
});
let selected = null;
let partSize = canvas.width / 5;
let p1 = createBezierPoint({ x: partSize, y: canvas.height / 2 });
let p2 = createBezierPoint({ x: partSize * 2, y: canvas.height / 2 });
let p3 = createBezierPoint({ x: partSize * 3, y: canvas.height / 2 });
let objects = [
    p1.a, p1.b, p1.center,
    p2.a, p2.b, p2.center,
    p3.a, p3.b, p3.center
];
let centers = [
    p1.center,
    p2.center,
    p3.center
];
requestAnimationFrame(draw);
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const obj of objects) {
        obj.draw();
    }
    let last = centers[0];
    for (let i = 1; i < centers.length; i++) {
        let current = centers[i];
        context.beginPath();
        context.moveTo(last.x, last.y);
        for (let t = 0; t <= 1; t += 0.001) {
            let p = bezierInterpol(t, last, last.a, current.b, current);
            context.lineTo(p.x, p.y);
        }
        context.stroke();
        context.closePath();
        last = current;
    }
    requestAnimationFrame(draw);
}
function hitDetect(pos) {
    for (const obj of objects) {
        if (obj.contains(pos)) {
            return obj;
        }
    }
    return null;
}
function mousePressed(pos) {
    let p = hitDetect(pos);
    if (p) {
        selected = p;
        canvas.style.cursor = "grabbing";
    }
}
function mouseReleased() {
    selected = null;
    canvas.style.cursor = "";
}
function mouseDragged(pos, delta) {
    if (selected) {
        selected.onDrag(delta);
    }
}
function mouseMoved(pos) {
    if (!selected) {
        let p = hitDetect(pos);
        if (p) {
            canvas.style.cursor = "grab";
        }
        else {
            canvas.style.cursor = "";
        }
    }
}
//# sourceMappingURL=sketch.js.map