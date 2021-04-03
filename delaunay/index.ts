import { hsvToRgb, rgbToHex, shuffle } from "../helper.js";

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

let width = 0;
let height = 0;

const scale = 9;

interface Point {
    x: number;
    y: number;
}
type Triangle = [Point, Point, Point];

let points: Point[] = [];

let superTriangle: Triangle = [
    { x: 50, y: -50 },
    { x: 200, y: 100 },
    { x: -100, y: 100 }
];
let triangulation: Triangle[] = [];

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.createElement("canvas");
    canvas.addEventListener("click", (e) => {
        // width / 2 - 50 * scale, height / 2 - 50 * scale
        let x = (e.offsetX - width / 2) / scale + 50;
        let y = (e.offsetY - height / 2) / scale + 50;

        console.log(x, y);

        if (x < 0 || x > 100 || y < 0 || y > 100) return;

        points.push({
            x, y
        });
        insertPoint({ x, y });
    });

    document.body.append(canvas);
    resize();

    context = canvas.getContext("2d");

    window.addEventListener("resize", resize);

    // genPoints();

    draw();

    triangulation.push(superTriangle);

    /*for (const p of points) {
        insertPoint(p);

        await sleep(100);
    }

    for (let i = 0; i < triangulation.length; i++) {
        const t = triangulation[i];
        if (hasSuper(t)) {
            triangulation.splice(i, 1);
            i--;
        }
    }*/

    // algo();
});

function inCircle(a: Point, b: Point, c: Point, d: Point) {
    let ax_ = a.x - d.x;
    let ay_ = a.y - d.y;
    let bx_ = b.x - d.x;
    let by_ = b.y - d.y;
    let cx_ = c.x - d.x;
    let cy_ = c.y - d.y;
    return (
        (ax_ * ax_ + ay_ * ay_) * (bx_ * cy_ - cx_ * by_) -
        (bx_ * bx_ + by_ * by_) * (ax_ * cy_ - cx_ * ay_) +
        (cx_ * cx_ + cy_ * cy_) * (ax_ * by_ - bx_ * ay_)
    ) > 0;
}

function ccw(t: Triangle) {
    const a = t[0];
    const b = t[1];
    const c = t[2];

    return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y) > 0;
}

async function insertPoint(p: Point) {
    context.fillStyle = "#f00";
    drawPoint(p);

    let badTriangles: Triangle[] = [];

    for (let i = 0; i < triangulation.length; i++) {
        const triangle = triangulation[i];

        /*context.strokeStyle = "#f00";
        drawCirc(triangle);
        drawTri(triangle);

        await sleep(100);*/

        if (inCircle(...triangle, p)) {
            badTriangles.push(triangle);
            triangulation.splice(i, 1);
            i--;

            await sleep(100);
        }
    }

    let poly: Point[][] = [];

    for (const triangle of badTriangles) {
        let e1 = false;
        let e2 = false;
        let e3 = false;

        for (const t1 of badTriangles) {
            if (t1 == triangle) continue;

            let A = t1.includes(triangle[0]);
            let B = t1.includes(triangle[1]);
            let C = t1.includes(triangle[2]);

            e1 ||= A && B;
            e2 ||= B && C;
            e3 ||= C && A;
        }

        if (!e1) poly.push([triangle[0], triangle[1]]);
        if (!e2) poly.push([triangle[1], triangle[2]]);
        if (!e3) poly.push([triangle[2], triangle[0]]);
    }

    for (const edge of poly) {
        let t: Triangle = [edge[0], edge[1], p];
        while (!ccw(t)) {
            shuffle(t);
        }
        triangulation.push(t);
        await sleep(100);
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;
}

function drawPoint(p: Point) {
    context.fillRect(p.x * scale - scale / 2, p.y * scale - scale / 2, scale - 1, scale - 1);
}
function drawCirc(t: Triangle) {
    context.beginPath();
    let circ = circumcircle(t[0], t[1], t[2]);
    context.ellipse(circ.x * scale, circ.y * scale, circ.r * scale, circ.r * scale, 0, 0, Math.PI * 2);
    context.stroke();
    context.closePath();
}
function drawTri(t: Triangle, fill = false) {
    context.beginPath();
    context.moveTo(t[0].x * scale, t[0].y * scale);
    context.lineTo(t[1].x * scale, t[1].y * scale);
    context.lineTo(t[2].x * scale, t[2].y * scale);
    context.lineTo(t[0].x * scale, t[0].y * scale);
    if (fill) context.fill();
    context.stroke();
    context.closePath();
}

function circumcircle(a: Point, b: Point, c: Point) {
    let A = b.x - a.x,
        B = b.y - a.y,
        C = c.x - a.x,
        D = c.y - a.y,
        E = A * (a.x + b.x) + B * (a.y + b.y),
        F = C * (a.x + c.x) + D * (a.y + c.y),
        G = 2 * (A * (c.y - b.y) - B * (c.x - b.x)),
        minx, miny, dx, dy

    /* If the points of the triangle are collinear, then just find the
     * extremes and use the midpoint as the center of the circumcircle. */
    if (Math.abs(G) < 0.000001) {
        minx = Math.min(a.x, b.x, c.x)
        miny = Math.min(a.y, b.y, c.y)
        dx = (Math.max(a.x, b.x, c.x) - minx) * 0.5
        dy = (Math.max(a.y, b.y, c.y) - miny) * 0.5

        return {
            x: minx + dx,
            y: miny + dy,
            r: Math.sqrt(dx * dx + dy * dy)
        };
    } else {
        let x = (D * E - B * F) / G
        let y = (A * F - C * E) / G
        dx = x - a.x
        dy = y - a.y

        return { x, y, r: Math.sqrt(dx * dx + dy * dy) };
    }
}

function hasSuper(t: Triangle) {
    return t.some(x => x == superTriangle[0] || x == superTriangle[1] || x == superTriangle[2])
}

function draw() {
    context.resetTransform();
    context.clearRect(0, 0, width, height);
    context.translate(width / 2 - 50 * scale, height / 2 - 50 * scale);

    for (let i = 0; i < triangulation.length; i++) {
        const t = triangulation[i];

        if (hasSuper(t)) continue;

        // context.fillStyle = rgbToHex(hsvToRgb((i / 10) % 360, 1, 1));
        context.fillStyle = "#AAA";
        context.strokeStyle = "#000";
        drawTri(t, false);

        // context.strokeStyle = "#AAA";
        // drawCirc(t);
    }

    context.fillStyle = "#000";
    points.forEach(drawPoint);
    context.strokeRect(0, 0, 100 * scale, 100 * scale);

    requestAnimationFrame(draw);
}

function genPoints() {
    function rand() {
        return Math.floor(Math.random() * 100);
    }

    function genCirc(x, y, r) {
        points.push({ x, y });

        for (let i = 0; i < 20; i++) {
            let o = (i / 20) * 2 * Math.PI + 0.00001;

            points.push({
                x: Math.sin(o) * r + x,
                y: Math.cos(o) * r + y
            })
        }
    }

    /*for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            genCirc(x * 20 + 20, y * 20 + 20, 5);
        }
    }*/

    // genCirc(50, 50, 40);

    /*points.push({
        x: rand(),
        y: rand()
    });*/
}


function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}
