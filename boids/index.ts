import { circle, createCanvas, line, triangle } from "../framework.js";

interface Dict<T> {
    [i: string]: T;
}

const minSpeed = 100;
const maxSpeed = 250;
const wallForce = 500;
const wallRange = 50;

let perceptionRadius = 125;
let seperateForce = 5000;
let alignForce = 1;
let cohesionForce = 1;


let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let boids: Boid[] = [];
let last = 0;

let els: Dict<HTMLInputElement> = {
    sep: undefined,
    align: undefined,
    coh: undefined,
    range: undefined,

    dVel: undefined,
    dAcc: undefined,
}

class Boid {
    highlight: boolean;

    // position
    x: number;
    y: number;

    // velocity
    vx: number;
    vy: number;

    // acceleration
    ax: number;
    ay: number;

    constructor() {
        this.highlight = false;

        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;

        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;

        this.ax = 0;
        this.ay = 0;
    }

    updateVel() {
        this.ax = 0;
        this.ay = 0;

        // Walls
        if (this.x < wallRange) {
            // Left
            this.ax += wallForce;
        } else if (this.x > canvas.width - wallRange) {
            // Right
            this.ax -= wallForce;
        }

        if (this.y < wallRange) {
            // Top
            this.ay += wallForce;
        } else if (this.y > canvas.height - wallRange) {
            // Bottom
            this.ay -= wallForce;
        }

        let count = 0;
        let x1 = 0;
        let y1 = 0;

        let x2 = 0;
        let y2 = 0;

        for (const b1 of boids) {
            if (this === b1) {
                continue;
            }
            const xDiff = b1.x - this.x;
            const yDiff = b1.y - this.y;
            const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

            if (dist < perceptionRadius) {
                count++;

                // Separation
                if (dist != 0) { // divide by 0 protection
                    this.ax -= (xDiff / (dist * dist)) * seperateForce;
                    this.ay -= (yDiff / (dist * dist)) * seperateForce;
                }

                // Alignment 
                x1 += b1.vx;
                y1 += b1.vy;

                // Cohesion
                x2 += b1.x;
                y2 += b1.y;
            }
        }

        if (count > 0) {
            // Alignment 
            this.ax += (x1 / count - this.vx) * alignForce;
            this.ay += (y1 / count - this.vy) * alignForce;

            // Cohesion
            this.ax += (x2 / count - this.x) * cohesionForce;
            this.ay += (y2 / count - this.y) * cohesionForce;
        }
    }

    updatePos(dt: number) {
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        if (speed > maxSpeed) {
            this.vx = (this.vx / speed) * maxSpeed;
            this.vy = (this.vy / speed) * maxSpeed;
        }

        if (speed < minSpeed) {
            this.vx = (this.vx / speed) * minSpeed;
            this.vy = (this.vy / speed) * minSpeed;
        }

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        if (this.x > canvas.width) {
            this.x -= canvas.width;
        } else if (this.x < 0) {
            this.x += canvas.width;
        }

        if (this.y > canvas.height) {
            this.y -= canvas.height;
        } else if (this.y < 0) {
            this.y += canvas.height;
        }
    }

    draw() {
        if (this.highlight) {
            if (els.dVel.checked) {
                context.strokeStyle = "#0f0";
                line(this.x, this.y, this.x + this.vx, this.y + this.vy);
            }
            if (els.dAcc.checked) {
                context.strokeStyle = "#0ff";
                line(this.x, this.y, this.x + this.ax, this.y + this.ay);
            }

            context.strokeStyle = "#f00";
            circle(this.x, this.y, perceptionRadius);
        } else {
            context.strokeStyle = "#88f";
        }

        context.save();
        context.translate(this.x, this.y);
        context.rotate(Math.atan2(this.vy, this.vx));
        triangle(5, 0, -5, 5, -5, -5);
        context.restore();
        // line(this.x, this.y, this.x + this.dx * 5, this.y + this.dy * 5);
        // ellipse(this.x, this.y, 10);
    }
}

for (const key in els) {
    els[key] = document.getElementById(key) as HTMLInputElement;
}

els.sep.addEventListener("input", (e) => {
    seperateForce = (els.sep.valueAsNumber / 100) * 10000;
});
els.align.addEventListener("input", (e) => {
    alignForce = (els.align.valueAsNumber / 100) * 2;
});
els.coh.addEventListener("input", (e) => {
    cohesionForce = (els.coh.valueAsNumber / 100) * 2;
});
els.range.addEventListener("input", (e) => {
    perceptionRadius = (els.range.valueAsNumber / 100) * 200;
});

[canvas, context] = createCanvas();

for (let i = 0; i < 100; i++) {
    boids[i] = new Boid();
}
boids[0].highlight = true;

last = performance.now();
requestAnimationFrame(draw);

function draw() {
    let now = performance.now();
    let dt = (now - last) / 1000;
    last = now;

    context.fillRect(0, 0, canvas.width, canvas.height);

    for (const boid of boids) {
        boid.updateVel();
    }

    for (const boid of boids) {
        boid.updatePos(dt);
        boid.draw();
    }

    requestAnimationFrame(draw);
}
