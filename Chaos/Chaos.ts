import { createCanvas } from "../framework.js";

// const scalee = (window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth) / 40;
let scale = 250;

const tRange = 2;
const pointCount = 500;
const delta_per_step = 1e-5;
const delta_minimum = 1e-8;
const speed_mult = 1;

const base27 = "_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const param: number[] = [];

interface Point {
    x: number;
    y: number;
}

const colors = new Uint8Array(pointCount * 3);
const points: Point[] = new Array(pointCount);
for (let i = 0; i < pointCount; i++) {
    points[i] = { x: 0, y: 0 };
}

const good = ["VKDI_J", "DPPREG", "Q_NRLG", "QOORGF", "CZHOWK", "RRQBFH", "VPTQVZ", "MWRSOI", "LIELMS", "ATYLGC", "AYXKRC", "T_ZOJJ", "BBSSQW", "GHUSCK", "EPYCUR", "FERLDW", "QVEFMJ", "HXNPOC", "BADJID", "HOBNXY, CF_JFV, BYOMND, AMAOHJ, HVJXRY, AZUIKA", "MRZHLC", "FZCRZJ", "CMZMME", "ROKEDQ", "ASHQ_D", "WEDFYE", "XZEXGK", "PJBRSP", "GPDK_P", "RIVNKU", "O_NEVU", "HFXERR", "RIKMFJ", "DVLNWO"];

const loadInput = document.getElementById("loadInput") as HTMLInputElement;
const loadButton = document.getElementById("loadButton") as HTMLButtonElement;
const autoInput = document.getElementById("autoInput") as HTMLInputElement;
const codeText = document.getElementById("codeText");
const dText = document.getElementById("dText") as HTMLParagraphElement;
const timeText = document.getElementById("timeText") as HTMLParagraphElement;
const fpsText = document.getElementById("fpsText") as HTMLParagraphElement;

let rolling_delta = delta_per_step;

let t = -tRange;
let auto = true;
let data: Uint8ClampedArray;
let pixels: ImageData;

let fps = 60;

let xOff = 0;
let yOff = 0;

loadButton.addEventListener("click", () => {
    load(loadInput.value);
});
autoInput.addEventListener("change", () => {
    auto = autoInput.checked;
});

function hPoint(p: number, i: number) {
    const pos = 4 * p;
    i = (i * 3) | 0;

    data[pos] = colors[i];
    data[pos + 1] = colors[i + 1];
    data[pos + 2] = colors[i + 2];
    data[pos + 3] = 255;

    // data[pos] += 1;
    // data[pos + 1] += 1;
    // data[pos + 2] += 1;
    // data[pos + 3] = 255;
}

function hue2rgb(t: number) {
    if (t < 0) {
        t += 1;
    } else if (t > 1) {
        t -= 1;
    }
    if (t < 1 / 6) {
        return 6 * t;
    }
    if (t < 1 / 2) {
        return 1;
    }
    if (t < 2 / 3) {
        return (2 / 3 - t) * 6;
    }
    return 0;
}

const [canvas, context] = createCanvas({ onResize: loadPixels, onDrag: onDrag });
canvas.addEventListener("wheel", (e) => {
    if(e.deltaY < 0) {
        scale *= 1.1;
    } else {
        scale /= 1.1;
    }
}); 
document.getElementById("main").append(canvas);
loadPixels();

function loadPixels() {
    pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    data = pixels.data;
}

function onDrag(x: number, y: number) {
    xOff += x;
    yOff += y;
}

for (let i = 0; i < pointCount; i++) {
    const f = ((i / pointCount) * 2) % 1;
    const index = i * 3;

    colors[index] = (hue2rgb(f + 1 / 3) * 255) | 0;
    colors[index + 1] = (hue2rgb(f) * 255) | 0;
    colors[index + 2] = (hue2rgb(f - 1 / 3) * 255) | 0;
}

regen();
requestAnimationFrame(draw);

function regen() {
    for (let i = 0; i < 18; i++) {
        // param[i] = Math.random() * 2 - 1;

        const rnd = Math.random() * 3;
        if (rnd < 1) {
            param[i] = -1;
        } else if (rnd < 2) {
            param[i] = 0;
        } else {
            param[i] = 1;
        }
    }

    // load(good[Math.floor(Math.random() * good.length)]);
    // load("UIZWSZ");
    reset();
}

function reset() {
    const s = pixels.width * pixels.height * 4;
    for (let i = 0; i < s; i += 4) {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 0;
    }

    t = -tRange;
    codeText.innerText = savee();
}

function savee() {
    let a = 0;
    let out = "";
    for (let i = 0; i < 18; i++) {
        a = a * 3 + param[i] + 1;
        if (i % 3 === 2) {
            out += base27[a];
            a = 0;
        }
    }

    return out;
}

function load(str: string) {
    str = str.toUpperCase();

    for (let i = 0; i < 6; i++) {
        let a = base27.indexOf(str[i]);

        param[i * 3 + 2] = (a % 3) - 1;
        a = Math.floor(a / 3);
        param[i * 3 + 1] = (a % 3) - 1;
        a = Math.floor(a / 3);
        param[i * 3] = (a % 3) - 1;
    }

    reset();
}

let last = performance.now();

function draw() {
    let now = performance.now();
    let dt = (now - last) / 1000;
    last = now;

    const hW = pixels.width / 2 + xOff;
    const hH = pixels.height / 2 + yOff;

    // Decrease alpha
    const s = pixels.width * pixels.height * 4;
    for (let i = 0; i < s; i += 4) {
        // data[i + 0] -= 1;
        // data[i + 1] -= 1;
        // data[i + 2] -= 1;
        data[i + 3] -= 10;
    }


    const delta = delta_per_step * speed_mult;

    while (performance.now() - now < 10) {
        let x = t;
        let y = t;
        let count = 0;

        rolling_delta = rolling_delta * 0.99 + delta * 0.01;

        for (let i = 0; i < pointCount; i++) {
            const l = points[i];

            const nX = x * (x * param[0] + y * param[3] + t * param[4] + param[6]) + y * (y * param[1] + t * param[5] + param[7]) + t * (param[8] + t * param[2]);
            const nY = x * (x * param[9] + y * param[12] + t * param[13] + param[15]) + y * (y * param[10] + t * param[14] + param[16]) + t * (param[17] + t * param[11]);

            x = nX;
            y = nY;

            const sX = x * scale;
            const sY = y * scale;

            if (sX > -hW && sX < hW && sY > -hH && sY < hH) {
                count++;
                const xDiff = sX - l.x;
                const yDiff = sY - l.y;
                const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

                l.x = sX;
                l.y = sY;

                const p = (((sX + hW) | 0) + ((sY + hH) | 0) * pixels.width) | 0;

                hPoint(p, i);

                rolling_delta = Math.min(rolling_delta, Math.max(delta / (dist + 1e-5), delta_minimum * speed_mult));
            } else {
                l.x = 0;
                l.y = 0;
            }
        }

        /*if (pCount > 10) {
            dist /= pCount;
            const desired = 0.001 / dist; // * (pCount / changed);

            delta = delta * 0.99 + desired * 0.01;
            dText.innerText = desired;

            delta = Math.min(0.001, delta);
            t += delta / steps;
        } else {
            t += 0.001;
            delta = 1e-10;
        }*/
        if (count == 0) rolling_delta = delta_per_step * 10;
        t += rolling_delta;

        /*if(pCount == 0) {

        } else {
            t += 0.000001;
        }*/

        dText.innerText = rolling_delta.toString();
    }

    now = performance.now();
    if (t > tRange) {
        if (auto) {
            regen();
        } else {
            reset();
        }
    }

    context.putImageData(pixels, 0, 0);
    timeText.innerText = t.toString();
    fps = fps * 0.99 + (1 / dt) * 0.01;
    fpsText.innerText = fps.toFixed(2);

    requestAnimationFrame(draw);
}
