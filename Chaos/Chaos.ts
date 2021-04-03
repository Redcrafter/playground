const scalee = (window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth) / 40;
const hW = window.innerWidth / 2;
const hH = window.innerHeight / 2;

const tRange = 2;
const pointCount = 500;
const steps = 500;
const base27 = "_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const param: number[] = [];
const colors = new Uint8Array(pointCount * 3);
const points = new Array(pointCount);
// const good = ["Q_NRLG", "QOORGF", "CZHOWK", "RRQBFH", "VPTQVZ", "MWRSOI", "LIELMS", "ATYLGC", "AYXKRC", "T_ZOJJ", "BBSSQW", "GHUSCK", "EPYCUR", "FERLDW", "QVEFMJ", "HXNPOC", "BADJID", "HOBNXY, CF_JFV, BYOMND, AMAOHJ, HVJXRY, AZUIKA", "MRZHLC", "FZCRZJ", "CMZMME", "ROKEDQ", "ASHQ_D", "WEDFYE", "XZEXGK", "PJBRSP"];
// GPDK_P, RIVNKU, O_NEVU 

const loadInput = document.getElementById("loadInput") as HTMLInputElement;
const loadButton = document.getElementById("loadButton") as HTMLButtonElement;
const autoInput = document.getElementById("autoInput") as HTMLInputElement;

let delta = 0.001;
let t = -tRange;
let auto = false;
let data: Uint8Array;
let startTime = performance.now();
let fps = 60;

loadButton.addEventListener("click", () => {
    load(loadInput.value);
});
autoInput.addEventListener("change", () => {
    auto = autoInput.checked;
});

function hPoint(p: number, i: number) {
    const pos = 4 * p;
    const diff = data[pos + 3];

    if (diff !== 255) {
        i = (i * 3) | 0;
        data[pos] = colors[i];
        data[pos + 1] = colors[i + 1];
        data[pos + 2] = colors[i + 2];
        data[pos + 3] = 255;

        return (255 - diff) | 0;
    } else {
        return 0;
    }
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

function setup() {
    const canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent("main");
    loadPixels();
    data = imageData.data;

    stroke(2);
    colorMode(HSB, 1);

    for (let i = 0; i < pointCount; i++) {
        const f = ((i / pointCount) * 2) % 1;
        const index = i * 3;

        colors[index] = (hue2rgb(f + 1 / 3) * 255) | 0;
        colors[index + 1] = (hue2rgb(f) * 255) | 0;
        colors[index + 2] = (hue2rgb(f - 1 / 3) * 255) | 0;
    }

    regen();
}

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

    reset();
}

function reset() {
    const s = width * height * 4;
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

function draw() {
    // Decrease alpha
    const s = width * height * 4;
    for (let i = 0; i < s; i += 4) {
        data[i + 3] *= 0.99;
    }

    for (let step = 0; step < steps; step++) {
        let x = t;
        let y = t;
        let pCount = 0 | 0;
        let dist = 0 | 0;
        let changed = 0;

        for (let i = 0; i < pointCount; i++) {
            const nX = x * (x * param[0] + y * param[3] + t * param[4] + param[6]) + y * (y * param[1] + t * param[5] + param[7]) + t * (param[8] + t * param[2]);
            y = x * (x * param[9] + y * param[12] + t * param[13] + param[15]) + y * (y * param[10] + t * param[14] + param[16]) + t * (param[17] + t * param[11]);
            x = nX;

            const sX = x * scalee;
            const sY = y * scalee;

            if (sX > -hW && sX < hW && sY > -hH && sY < hH) {
                pCount++;

                const p = (((sX + hW) | 0) + ((sY + hH) | 0) * width) | 0;

                const c = hPoint(p, i);
                changed += c;

                const l = points[i];
                if (l) {
                    const xDiff = (sX - l.sX) | 0;
                    const yDiff = (sY - l.sY) | 0;
                    l.sX = sX;
                    l.sY = sY;

                    // dist += Math.sqrt(xDiff * xDiff + yDiff * yDiff);
                    dist += xDiff * xDiff + yDiff * yDiff;
                } else {
                    points[i] = {
                        sX,
                        sY,
                    };
                    dist += 10;
                }
            } else {
                points[i] = null;
            }
        }

        if (pCount !== 0) {
            // const asdf  = changed / 255;

            const desired = 5 / Math.sqrt(dist / pCount); // * (pCount / changed);

            delta = delta * (0.99 + desired * 0.01);

            delta = Math.min(0.001, delta);
            t += delta / steps;
        } else {
            t += 0.001;
            delta = 1e-10;
        }
    }

    const now = performance.now();
    if (t > tRange || (auto && now - startTime > 120000)) {
        if (auto) {
            regen();
        } else {
            reset();
        }
        startTime = now;
    }

    updatePixels();
    timeText.innerText = t;
    fps = fps * 0.99 + frameRate() * 0.01;
    fpsText.innerText = fps.toFixed(2);
}
