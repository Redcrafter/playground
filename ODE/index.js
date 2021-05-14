import { createCanvas, canvas, context, line, arrow } from "../framework.js";
let odes = {
    pendulum: (x, y) => {
        const g = 9.8;
        const L = 2;
        const mu = 0;
        return -mu * y - (g / L) * Math.sin(x);
    },
    spiral: (x, y) => {
        const k = 1;
        const m = 1;
        return -(k / m) * x;
    },
    idk: (x, y) => {
        const mu = 0.1;
        return mu * (1 - x ** 2) * y - x;
    },
    idk1: (x, y) => -x + (Math.exp(-0.001 * y) * Math.sin((Math.PI / 4) * y)),
    idk2: (x, y) => -Math.sin(x) + Math.exp(-2 * y),
    idk3: (x, y) => -(x ** 3) + Math.cos(5 * y),
    idk4: (x, y) => 0.5 * x,
};
let ODE = odes.pendulum;
createCanvas();
context.font = "15px arial";
context.textAlign = "center";
context.textBaseline = "middle";
requestAnimationFrame(draw);
let paths = [];
const maxPoints = 50;
const maxAge = 300;
const drawGrid = true;
const drawArrows = true;
function draw() {
    context.resetTransform();
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.translate(canvas.width / 2, canvas.height / 2);
    context.fillStyle = "#fff";
    const scaleX = 75;
    const scaleY = 75;
    const dt = 1 / 60;
    for (let i = 0; i < 1; i++) {
        paths.push({
            age: 0,
            points: [
                [(Math.random() - 0.5) * canvas.width / scaleX * 1.5, (Math.random() - 0.5) * canvas.height / scaleY * 1.5]
            ]
        });
    }
    while (paths[0].age == maxAge) {
        paths.shift();
    }
    context.strokeStyle = "#fff";
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
        }
        else {
            path.points.shift();
        }
        path.age++;
        context.beginPath();
        for (const point of path.points) {
            context.lineTo(point[0] * scaleX, -point[1] * scaleY);
        }
        context.stroke();
        context.closePath();
    }
    let w = Math.ceil(canvas.width / scaleX / 2);
    w -= ((w / 2) % Math.PI) * 2;
    let h = Math.ceil(canvas.height / scaleY / 2);
    if (drawArrows) {
        context.strokeStyle = "#888";
        for (let theta = -w; theta <= w; theta += 0.25) {
            for (let thetaDot = -h; thetaDot <= h; thetaDot += 0.25) {
                let res = ODE(theta, thetaDot);
                let m = Math.sqrt(thetaDot ** 2 + res ** 2);
                // thetaDot * scaleX, res * scaleY
                arrow(theta * scaleX, -thetaDot * scaleY, scaleX / 5, -Math.atan2(res, thetaDot));
                context.stroke();
            }
        }
    }
    if (drawGrid) {
        context.strokeStyle = "#888";
        for (let i = -h; i <= h; i += 1) {
            line(-canvas.width / 2, i * scaleY, canvas.width / 2, i * scaleY);
            if (i == 0)
                continue;
            context.fillText((-i).toFixed(1), -15, i * scaleY);
        }
        for (let i = -w; i <= w; i += Math.PI / 2) {
            line(i * scaleX, -canvas.height / 2, i * scaleX, canvas.height / 2);
            if (i == 0)
                continue;
            context.fillText(i.toFixed(2), i * scaleX, 15);
        }
        context.fillText("0.0", -15, 15);
    }
    requestAnimationFrame(draw);
}
//# sourceMappingURL=index.js.map