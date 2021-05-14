import { createCanvas, context, canvas, circle, arrow } from "../framework.js";

let elements = {
    followBox: document.getElementById("followBox") as HTMLInputElement,
    speedSlider: document.getElementById("speedSlider") as HTMLInputElement
}

interface Point {
    x: number;
    y: number;
}

const points: Point[] = [];
let lastPoint = null;

let speed = 0.0005;
let follow = false;

let t = 0;
let vectors: {
    x: number;
    y: number;

    length: number;
    rot: number;

    x0: number;
    y0: number;

    x1: number;
    y1: number;
}[] = [];

let scale = 0.01;

createCanvas();

elements.followBox.addEventListener("click", () => follow = elements.followBox.checked);
elements.speedSlider.addEventListener("input", () => speed = elements.speedSlider.valueAsNumber);

fetch("./data.json").then(x => x.json()).then(x => {
    vectors = x.note.vectors;
    scale = x.note.scale;
    for (const v of vectors) {
        v.length = Math.sqrt(v.x * v.x + v.y * v.y);
        v.rot = Math.atan2(v.y, v.x);
    }
    // vectors = calcVectors(100, 0.005, x.note.svg);

    requestAnimationFrame(draw);
});

function draw() {
    context.resetTransform();
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let val = 2 * Math.PI * t;
    let x = 0;
    let y = 0;

    let p = new Path2D()

    const count = (vectors.length - 1) / 2;

    function stuff(n: number) {
        const el = vectors[n + count];

        const re = Math.cos(n * val);
        const im = Math.sin(n * val);

        let x1 = el.x * re - el.y * im;
        let y1 = el.x * im + el.y * re;

        el.x0 = x;
        el.y0 = y;

        x += x1;
        y += y1;

        el.x1 = x;
        el.y1 = y;
    }

    // ignore first one to center drawing
    // stuff(0);
    for (let n = 1; n <= count; n++) {
        stuff(n);
        stuff(-n);
    }
    //#endregion

    if (follow) {
        context.translate(-x * scale + canvas.width / 2, -y * scale + canvas.height / 2);
    } else {
        context.translate(canvas.width / 2, canvas.height / 2);
    }

    //#region Draw points
    let added = false;

    if (lastPoint === null) {
        lastPoint = {
            x,
            y
        };
        points.push({
            x,
            y
        });
    } else {
        const xDiff = lastPoint.x - x;
        const yDiff = lastPoint.y - y;

        if (Math.sqrt(xDiff * xDiff + yDiff * yDiff) >= 0.1) {
            added = true;
            points.push({
                x,
                y
            });
            lastPoint.x = x;
            lastPoint.y = y;
        }
    }

    context.strokeStyle = "#ff0";
    context.beginPath();
    context.moveTo(points[0].x * scale, points[0].y * scale);

    for (let i = 1; i < points.length; i++) {
        // stroke((i / points.length) * 255, (i / points.length) * 255, 0);

        // line(last.x * scale, last.y * scale, next.x * scale, next.y * scale);
        // last = next;

        const next = points[i];
        context.lineTo(next.x * scale, next.y * scale);
    }
    context.stroke();
    context.closePath();
    //#endregion

    //#region Draw lines
    context.fillStyle = "#fff";
    // line(0, 0, asdf[count].x * scale, asdf[count].y * scale);
    for (let i = count; i > 0; i--) {
        const b = vectors[count - i];
        // line(b.x0 * scale, b.y0 * scale, b.x1 * scale, b.y1 * scale);
        arrow(b.x0 * scale, b.y0 * scale, b.length * scale, -i * val + b.rot, 20);
        context.fill();

        const a = vectors[count + i];
        arrow(a.x0 * scale, a.y0 * scale, a.length * scale, i * val + a.rot, 20);
        context.fill();
        // line(a.x0 * scale, a.y0 * scale, a.x1 * scale, a.y1 * scale);
    }

    context.strokeStyle = "#add8e664";
    for (let i = count; i > 0; i--) {
        const b = vectors[count - i];
        circle(b.x0 * scale, b.y0 * scale, b.length * scale * 2);

        const a = vectors[count + i];
        circle(a.x0 * scale, a.y0 * scale, a.length * scale * 2);
    }

    // stroke(64);
    // ellipse(x0, y0, el.length * scale * 2);
    //#endregion

    t = (t + speed);
    if (added && t > 1) {
        points.shift();
    }

    requestAnimationFrame(draw);
}
canvas.addEventListener("wheel", e => {
    if (e.deltaY > 0) {
        scale /= 1.2;
    } else {
        scale *= 1.2;
    }
}, { passive: true });

function calcVectors(count: number, acc: number, data: string) {
    function integrate(f: number) {
        // let sum = 0;
        let xSum = 0;
        let ySum = 0;

        let t = 0;

        while (t < 1) {
            const res = path.getPointAtLength(t * pathLength);
            const val = -2 * Math.PI * f * t;

            const re = Math.cos(val);
            const im = Math.sin(val);

            xSum += res.x * re - res.y * im;
            ySum += res.x * im + res.y * re;

            t += acc;
        }

        return {
            x: xSum * acc,
            y: ySum * acc
        };
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", data);

    const pathLength = path.getTotalLength();
    let vectors = new Array(count * 2 + 1);

    for (let i = -count; i <= count; i++) {
        vectors[i + count] = integrate(i);
    }

    console.log(JSON.stringify(vectors));

    return vectors;
}
