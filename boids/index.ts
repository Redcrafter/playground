// const constSpeed = 200;
const minSpeed = 100;
const maxSpeed = 250;

const maxSteerForce = 100;

const perceptionRadius = 125;
const avoidRadius = 50;

class Boid {
    highlight: boolean;

    x: number;
    y: number;

    dx: number;
    dy: number;

    ang: number;

    ndx: number;
    ndy: number;

    constructor() {
        this.highlight = false;

        this.x = Math.random() * width;
        this.y = Math.random() * height;

        /*this.dx = (Math.random() - 0.5) * 2 * ((minSpeed + maxSpeed) / 2);
        this.dy = (Math.random() - 0.5) * 2 * ((minSpeed + maxSpeed) / 2); */
        this.dx = (Math.random() - 0.5) * 2;
        this.dy = (Math.random() - 0.5) * 2;

        this.ang = Math.atan2(this.dy, this.dx);

        this.ndx = 0;
        this.ndy = 0;
    }

    update(dt: number) {
        this.dx += this.ndx / (1000 / dt);
        this.dy += this.ndy / (1000 / dt);

        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

        if (speed > maxSpeed) {
            this.dx = (this.dx / speed) * maxSpeed;
            this.dy = (this.dy / speed) * maxSpeed;
        }

        if (speed < minSpeed) {
            this.dx = (this.dx / speed) * minSpeed;
            this.dy = (this.dy / speed) * minSpeed;
        }

        this.ang = Math.atan2(this.dy, this.dx);

        this.x += this.dx / (1000 / dt);
        this.y += this.dy / (1000 / dt);

        if (this.x > width) {
            this.x -= width;
        } else if (this.x < 0) {
            this.x += width;
        }

        if (this.y > height) {
            this.y -= height;
        } else if (this.y < 0) {
            this.y += height;
        }
    }

    draw() {
        if (this.highlight) {
            stroke(255, 0, 0);

            ellipse(this.x, this.y, perceptionRadius);
            ellipse(this.x, this.y, avoidRadius);
        } else {
            stroke(128, 128, 255);
        }

        push();
        translate(this.x, this.y);
        rotate(Math.atan2(this.dy, this.dx));
        triangle(5, 0, -5, 5, -5, -5);

        pop();
        // line(this.x, this.y, this.x + this.dx * 5, this.y + this.dy * 5);
        // ellipse(this.x, this.y, 10);
    }
}

let boids: Boid[] = [];

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    // colorMode(HSB, 100);
    ellipseMode(RADIUS);
    noFill();
    // frameRate(60);

    for (let i = 0; i < 100; i++) {
        boids[i] = new Boid();
    }
    boids[0].highlight = true;
}

function asdf(x, y, dx, dy) {
    let len = Math.sqrt(x * x + y * y);
    x = (x / len) * maxSpeed - dx;
    y = (y / len) * maxSpeed - dy;

    len = Math.sqrt(x * x + y * y);
    if (len > maxSteerForce) {
        x = (x / len) * maxSteerForce;
        y = (y / len) * maxSteerForce;
    }

    return {
        x,
        y
    };
}

function draw() {
    background(0);

    for (const boid of boids) {
        let count = 0;

        let v1x = 0;
        let v1y = 0;

        let v2x = 0;
        let v2y = 0;

        let v3x = 0;
        let v3y = 0;

        let v4x = 0;
        let v4y = 0;

        // Walls
        if (boid.x - perceptionRadius < 0) {
            // Left
            v4x += 1;
        } else if (boid.x + perceptionRadius > width) {
            // Right
            v4x -= 1;
        }

        if (boid.y - perceptionRadius < 0) {
            // Top
            v4y += 1;
        } else if (boid.y + perceptionRadius > height) {
            // Bottom
            v4y -= 1;
        }

        // const ang = Math.atan2(boid.dy, boid.dx);

        for (const b1 of boids) {
            if (boid === b1) {
                continue;
            }

            const xDiff = b1.x - boid.x;
            const yDiff = b1.y - boid.y;
            const dist = Math.sqrt((xDiff * xDiff + yDiff * yDiff));

            if (dist > perceptionRadius) {
                continue;
            }

            // Wtf is going on
            /* const angDiff = boid.ang - Math.atan2(yDiff, xDiff);
            if (Math.abs(angDiff) > 2.35) {
                continue;
            } */

            count++;

            // Separation
            if (dist < avoidRadius) {
                v1x -= xDiff / (dist * dist);
                v1y -= yDiff / (dist * dist);

                if (boid.highlight) {
                    stroke(255 - (1 / dist) * 255);
                    line(boid.x, boid.y, b1.x, b1.y);
                }
            }

            // Alignment
            v2x += b1.dx;
            v2y += b1.dy;

            // Cohesion
            v3x += b1.x;
            v3y += b1.y;
        }

        boid.ndx = 0;
        boid.ndy = 0;

        if (v1x != 0 || v1y != 0) {
            let v1 = asdf(v1x, v1y, boid.dx, boid.dy);
            boid.ndx += v1.x;
            boid.ndy += v1.y;
        }


        if (count > 0) {
            v2x /= count;
            v2y /= count;

            v3x /= count;
            v3y /= count;

            let v2 = asdf(v2x, v2y, boid.dx, boid.dy);
            let v3 = asdf(v3x - boid.x, v3y - boid.y, boid.dx, boid.dy);

            boid.ndx += v2.x * 0.9 + v3.x * 0.8;
            boid.ndy += v2.y * 0.9 + v3.y * 0.8;
        }

        if (v4x != 0 || v4y != 0) {
            let v4 = asdf(v4x, v4y, boid.dx, boid.dy);
            boid.ndx += v4.x * 5;
            boid.ndy += v4.y * 5;
        }
    }

    for (const boid of boids) {
        boid.update(deltaTime);
        boid.draw();
    }
}