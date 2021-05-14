const G = 1;
let step = 4;
// manual offset
let gx = 0;
let gy = 0;
// automatic offset
let cx = 0;
let cy = 0;
// zoom
let zoom = 100;
let playing = false;
let canvas;
let radiusInput;
let massInput;
let xVelInput;
let yVelInput;
let xPosInput;
let yPosInput;
let followInput;
let context;
let width;
let height;
class Planet {
    constructor(x, y, dx = 0, dy = 0) {
        this.x = 0;
        this.y = 0;
        this.r = 10;
        this.mass = 1;
        this.hist = [];
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
    }
    draw() {
        context.beginPath();
        context.ellipse(this.x, this.y, this.r / zoom, this.r / zoom, 0, 0, Math.PI * 2);
        context.fill();
        if (playing) {
            this.hist.push({ x: this.x, y: this.y });
            if (this.hist.length > 1000) {
                this.hist.shift();
            }
        }
    }
    drawPath(rel) {
        if (this.hist.length < 2) {
            return;
        }
        context.beginPath();
        if (rel) {
            for (let i = 0; i < this.hist.length; i++) {
                const item = this.hist[i];
                const r = rel[i];
                context.lineTo(item.x - r.x, item.y - r.y);
            }
        }
        else {
            for (const item of this.hist) {
                context.lineTo(item.x, item.y);
            }
        }
        context.lineWidth = 1 / zoom;
        context.stroke();
    }
    updateVel(dt) {
        for (const other of planets) {
            if (other == this) {
                continue;
            }
            let cx = other.x - this.x;
            let cy = other.y - this.y;
            let sqrDist = cx ** 2 + cy ** 2;
            let dist = Math.sqrt(sqrDist);
            cx /= dist;
            cy /= dist;
            let force = G * other.mass / sqrDist;
            this.dx += cx * force * dt;
            this.dy += cy * force * dt;
        }
    }
    updatePos(dt) {
        this.x += this.dx * dt;
        this.y += this.dy * dt;
    }
}
let planets = [
    new Planet(0.97000436, -0.24308753, 0.93240737 / 2, 0.86473146 / 2),
    new Planet(-0.97000436, 0.24308753, 0.93240737 / 2, 0.86473146 / 2),
    new Planet(0, 0, -0.93240737, -0.86473146)
];
/*let planets = [
    new Planet(0, 0, 1, 0),
    new Planet(0, 200, 0, 0),
    new Planet(0, 400, 0.1, 0),
    new Planet(0, 600, 0, 0),
    new Planet(0, 800, 0, 0),
];*/
// planets[0].mass = 500;
let centerPlanet = null;
let selectedPlanet = null;
window.addEventListener("keypress", keyPress);
window.addEventListener("resize", resize);
setup();
function setup() {
    canvas = document.getElementById("main");
    // infoDiv = document.getElementById("info") as HTMLDivElement;
    radiusInput = document.getElementById("radiusInput");
    massInput = document.getElementById("massInput");
    xVelInput = document.getElementById("xVel");
    yVelInput = document.getElementById("yVel");
    xPosInput = document.getElementById("xPos");
    yPosInput = document.getElementById("yPos");
    followInput = document.getElementById("followInput");
    followInput.addEventListener("change", (e) => {
        if (selectedPlanet) {
            if (followInput.checked) {
                centerPlanet = selectedPlanet;
            }
            else {
                centerPlanet = null;
            }
        }
    });
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousewheel", onScroll, { passive: true });
    context = canvas.getContext("2d");
    resize();
    requestAnimationFrame(draw);
}
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
function keyPress(e) {
    switch (e.key) {
        case " ":
            playing = !playing;
            break;
        case "+":
            step *= 1.1;
            break;
        case "-":
            step /= 1.1;
            break;
        default:
            break;
    }
}
let mouseDown = false;
let holdingPlanet = null;
let lastX = 0;
let lastY = 0;
function findPlanet(mouseX, mouseY) {
    let x = (mouseX - width / 2) / zoom + cx - gx;
    let y = (mouseY - height / 2) / zoom + cy - gy;
    let p = null;
    for (const planet of planets) {
        let dist = Math.sqrt((planet.x - x) ** 2 + (planet.y - y) ** 2);
        if (dist < planet.r) {
            p = planet;
        }
    }
    return p;
}
function onClick(e) {
    selectedPlanet = findPlanet(e.clientX, e.clientY);
    if (selectedPlanet) {
        radiusInput.value = selectedPlanet.r;
        massInput.value = selectedPlanet.mass;
        xVelInput.value = selectedPlanet.dx;
        yVelInput.value = selectedPlanet.dy;
        xPosInput.value = selectedPlanet.x;
        yPosInput.value = selectedPlanet.y;
        followInput.checked = selectedPlanet == centerPlanet;
    }
}
function onMouseDown(e) {
    mouseDown = true;
    holdingPlanet = findPlanet(e.clientX, e.clientY);
}
function onMouseUp() {
    mouseDown = false;
    holdingPlanet = null;
}
function onMouseMove(e) {
    let dx = (e.clientX - lastX) / zoom;
    let dy = (e.clientY - lastY) / zoom;
    if (mouseDown && !holdingPlanet && e.shiftKey) {
        gx += dx;
        gy += dy;
    }
    else if (!playing && holdingPlanet) {
        holdingPlanet.x += dx;
        holdingPlanet.y += dy;
    }
    lastX = e.clientX;
    lastY = e.clientY;
}
function onScroll(e) {
    if (e.deltaY > 0) {
        // zoom out
        zoom /= 1.1;
    }
    else if (e.deltaY < 0) {
        // zoom in
        zoom *= 1.1;
    }
}
function draw() {
    context.resetTransform();
    context.clearRect(0, 0, width, height);
    context.translate(width / 2 + gx, height / 2 + gy);
    context.scale(zoom, zoom);
    context.save();
    if (centerPlanet) {
        cx = centerPlanet.x;
        cy = centerPlanet.y;
    }
    else {
        if (playing) {
            cx = 0;
            cy = 0;
            for (const planet of planets) {
                cx += planet.x;
                cy += planet.y;
            }
            cx /= planets.length;
            cy /= planets.length;
        }
    }
    context.translate(-cx, -cy);
    context.beginPath();
    if (!playing) {
        if (centerPlanet) {
            for (const planet of planets) {
                context.moveTo(planet.x, planet.y);
                context.lineTo(planet.x + (planet.dx - centerPlanet.dx) * 50, planet.y + (planet.dy - centerPlanet.dy) * 50);
            }
        }
        else {
            for (const planet of planets) {
                context.moveTo(planet.x, planet.y);
                context.lineTo(planet.x + planet.dx * 50 / zoom, planet.y + planet.dy * 50 / zoom);
            }
        }
        context.lineWidth = 1 / zoom;
        context.stroke();
    }
    if (playing) {
        const count = 100;
        const dt = 0.01 / count;
        for (let i = 0; i < step; i++) {
            for (let j = 0; j < count; j++) {
                for (const planet of planets) {
                    planet.updateVel(dt);
                }
                for (const planet of planets) {
                    planet.updatePos(dt);
                }
            }
        }
    }
    for (const planet of planets) {
        planet.draw();
    }
    if (centerPlanet) {
        context.restore();
        for (const planet of planets) {
            if (planets == centerPlanet) {
                continue;
            }
            planet.drawPath(centerPlanet.hist);
        }
    }
    else {
        for (const planet of planets) {
            planet.drawPath();
        }
    }
    if (selectedPlanet) {
        xVelInput.value = selectedPlanet.dx;
        yVelInput.value = selectedPlanet.dy;
        xPosInput.value = selectedPlanet.x;
        yPosInput.value = selectedPlanet.y;
    }
    requestAnimationFrame(draw);
}
export {};
//# sourceMappingURL=index.js.map