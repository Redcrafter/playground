interface IPoint {
    x: number;
    y: number;
}

interface IObject {
    contains(point: IPoint): boolean;
    draw(): void;

    onDrag(diff: IPoint): void;
}

class Circle implements IPoint, IObject {
    public x: number;
    public y: number;
    public r: number;

    constructor(x: number, y: number, r: number) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    public draw() {
        ellipse(this.x, this.y, this.r);
    }

    public contains(point: IPoint): boolean {
        const xDiff = point.x - this.x;
        const yDiff = point.y - this.y;

        const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        return dist <= this.r;
    }

    public onDrag(diff: IPoint): void {
        this.x += diff.x;
        this.y += diff.y;
    }
}

class BezierCenter extends Circle {
    public a: BezierPoint;
    public b: BezierPoint;

    public onDrag(diff: IPoint): void {
        this.x += diff.x;
        this.y += diff.y;

        this.a.x += diff.x;
        this.a.y += diff.y;

        this.b.x += diff.x;
        this.b.y += diff.y;
    }
}

class BezierPoint extends Circle {
    public center: BezierCenter;
    public other: BezierPoint;

    public draw() {
        ellipse(this.x, this.y, this.r);
        line(this.x, this.y, this.other.x, this.other.y);
    }

    public onDrag(diff: IPoint): void {
        this.x += diff.x;
        this.y += diff.y;

        this.other.x -= diff.x;
        this.other.y -= diff.y;
    }
}

function createBezierPoint(p: IPoint) {
    const center = new BezierCenter(p.x, p.y, 30);
    const a = new BezierPoint(p.x - 100, p.y - 100, 20);
    const b = new BezierPoint(p.x + 100, p.y + 100, 20);

    center.a = a;
    center.b = b;

    a.center = center;
    b.center = center;

    a.other = b;
    b.other = a;

    return { center, a, b };
}

function bezierPoint(t: number, p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint): IPoint {
    return {
        x: Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * t * t * p2.x +
            Math.pow(t, 3) * p3.x,
        y: Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * t * t * p2.y +
            Math.pow(t, 3) * p3.y
    }
}

let objects: IObject[];
let centers: BezierCenter[];

let canvas: HTMLCanvasElement;
let selected: IObject | null;

function setup(): void {
    canvas = createCanvas(window.innerWidth, window.innerHeight).canvas;
    let partSize = width / 5;

    let p1 = createBezierPoint({ x: partSize, y: height / 2 });
    let p2 = createBezierPoint({ x: partSize * 2, y: height / 2 });
    let p3 = createBezierPoint({ x: partSize * 4, y: height / 2 });

    objects = [
        p1.a, p1.b, p1.center,
        p2.a, p2.b, p2.center,
        p3.a, p3.b, p3.center
    ];

    centers = [
        p1.center,
        p2.center,
        p3.center
    ];
}

function draw(): void {
    background(255);

    for (const obj of objects) {
        obj.draw();
    }

    let last = centers[0];

    noFill();

    for (let i = 1; i < centers.length; i++) {
        let current = centers[i];

        beginShape();
        for (let t = 0; t <= 1; t += 0.001) {
            let p = bezierPoint(t, last, last.a, current.b, current);
            vertex(p.x, p.y);
            // point(p.x, p.y);
        }
        endShape();

        last = current;
    }
}

function hitDetect(): IObject | null {
    for (const obj of objects) {
        let p = {
            x: mouseX,
            y: mouseY
        };

        if (obj.contains(p)) {
            return obj;
        }
    }
    return null;
}

function mousePressed() {
    let p = hitDetect();
    if (p) {
        selected = p;
        canvas.style.cursor = "grabbing";
    }
}

function mouseReleased() {
    selected = null;
    canvas.style.cursor = "";
}

function mouseDragged() {
    if (selected) {
        selected.onDrag({
            x: mouseX - pmouseX,
            y: mouseY - pmouseY
        });

        return false;
    }
}

function mouseMoved() {
    if (!selected) {
        let p = hitDetect();
        if (p) {
            canvas.style.cursor = "grab";
        } else {
            canvas.style.cursor = "";
        }
    }
}