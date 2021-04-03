function ODE(theta, thetaDot) {
    const g = 9.8;
    const L = 2;
    const mu = 0;

    return -mu * thetaDot - (g / L) * Math.sin(theta);
}

/*function ODE(theta, thetaDot) {
    const k = 1;
    const m = 1;
    return -(k / m) * theta;
}*/

/*function ODE(theta, thetaDot) {
    const mu = 0.1;
    return mu * (1 - theta ** 2) * thetaDot - theta;
}*/

// return -x + (Math.exp(-0.001 * t) * Math.sin((Math.PI / 4) * t))
// return -Math.sin(x) + Math.exp(-2 * t); // 2
// return -(x ** 3) + Math.cos(5 * t); // 3
// return 0.5 * x; // 4


function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    stroke(255);
    // noLoop();

    translate(0, window.innerHeight / 2);
}

let paths: { age: number, points: number[][] }[] = [];
const maxPoints = 50;
const maxAge = 300;
const drawGrid = true;
const drawArrows = true;

function draw() {
    translate(width / 2, height / 2);
    background(0);

    const scaleX = 75;
    const scaleY = 75;
    const dt = 1 / 60;

    for (let i = 0; i < 1; i++) {
        paths.push({
            age: 0,
            points: [
                [(Math.random() - 0.5) * width / scaleX * 1.5, (Math.random() - 0.5) * height / scaleY * 1.5]
            ]
        });
    }

    while (paths[0].age == maxAge) {
        paths.shift();
    }

    noFill();
    stroke(255);
    for (const path of paths) {
        const last = path.points[path.points.length - 1];
        let theta = last[0];
        let thetaDot = last[1];

        if (path.age < maxAge - maxPoints) {
            // https://en.wikipedia.org/wiki/Symplectic_integrator
            for (let i = 0; i < 1; i++) {
                thetaDot += ODE(theta, thetaDot) * dt;
                theta += thetaDot * dt;
            }

            if (path.points.length == maxPoints) {
                path.points.shift();
            }
            path.points.push([theta, thetaDot]);
        } else {
            path.points.shift();
        }

        path.age++;

        beginShape();
        for (const point of path.points) {
            vertex(point[0] * scaleX, -point[1] * scaleY);
        }
        endShape();
    }

    let w = Math.ceil(width / scaleX / 2);
    w -= ((w / 2) % Math.PI) * 2;
    let h = Math.ceil(height / scaleY / 2);

    if (drawArrows) {
        stroke(128);
        for (let theta = -w; theta <= w; theta += 0.25) {
            for (let thetaDot = -h; thetaDot <= h; thetaDot += 0.25) {
                let res = ODE(theta, thetaDot);

                let m = Math.sqrt(thetaDot ** 2 + res ** 2);

                // thetaDot * scaleX, res * scaleY
                arrow(theta * scaleX, -thetaDot * scaleY, scaleX / 5, -Math.atan2(res, thetaDot));
            }
        }
    }

    if (drawGrid) {
        stroke(128);
        textSize(15);
        fill(255);
        textAlign(CENTER, CENTER);
        for (let i = -h; i <= h; i += 1) {
            line(-width / 2, i * scaleY, width / 2, i * scaleY);
            text((-i).toFixed(1), -10, i * scaleY);
        }

        for (let i = -w; i <= w; i += Math.PI / 2) {
            line(i * scaleX, -height / 2, i * scaleX, height / 2);
            text(i.toFixed(2), i * scaleX, -10);
        }
    }
}

function arrow(x0, y0, l, r) {
    let cos = Math.cos(r);
    let sin = Math.sin(r);

    let headSize = l / 6;
    let arrowWidth = l / 100;

    beginShape();

    vertex(x0 + cos * l, y0 + sin * l); // Tip

    vertex(x0 + cos * (l - 2 * headSize) + sin * headSize, y0 - cos * headSize + sin * (l - 2 * headSize)); // Top
    vertex(x0 + cos * (l - 2 * headSize) + sin * arrowWidth, y0 - cos * arrowWidth + sin * (l - 2 * headSize)); // Top mid


    vertex(x0 + sin * arrowWidth, y0 - cos * arrowWidth); // back top
    vertex(x0 - sin * arrowWidth, y0 + cos * arrowWidth); // back bottom

    vertex(x0 + cos * (l - 2 * headSize) - sin * arrowWidth, y0 + cos * arrowWidth + sin * (l - 2 * headSize)); // Bottom mid
    vertex(x0 + cos * (l - 2 * headSize) - sin * headSize, y0 + cos * headSize + sin * (l - 2 * headSize)); // Bottom

    endShape(CLOSE);
}
