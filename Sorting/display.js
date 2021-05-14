import { hslToRgb } from "../helper.js";
import algs from "./algs.js";
import SortArray from "./Array.js";
var DrawMode;
(function (DrawMode) {
    DrawMode[DrawMode["Ramp"] = 0] = "Ramp";
    DrawMode[DrawMode["RampDots"] = 1] = "RampDots";
    DrawMode[DrawMode["RampConnectedDots"] = 2] = "RampConnectedDots";
    DrawMode[DrawMode["Circle"] = 3] = "Circle";
    DrawMode[DrawMode["CircleDots"] = 4] = "CircleDots";
    DrawMode[DrawMode["Rect"] = 5] = "Rect";
})(DrawMode || (DrawMode = {}));
let displayMethod = DrawMode.Ramp;
const array = new SortArray(Draw);
const buttons = document.getElementById("buttons");
if (buttons == null) {
    throw new Error("");
}
for (const name in algs) {
    if (algs.hasOwnProperty(name)) {
        const b = document.createElement("button");
        b.innerText = name;
        b.addEventListener("click", () => Run(algs[name]));
        buttons.appendChild(b);
    }
}
let arraySize = 64;
let width = window.innerWidth;
let height = window.innerHeight;
const container = document.getElementById("container");
const canvas = document.getElementsByTagName("canvas")[0];
const context = canvas.getContext("2d");
const sizeInput = document.getElementById("sizeInput");
const speedInput = document.getElementById("speedInput");
const methodInput = document.getElementById("methodInput");
sizeInput.addEventListener("change", ResizeArray);
speedInput.addEventListener("change", UpdateSpeed);
methodInput.addEventListener("change", ChangeMethod);
window.addEventListener("resize", WindowResize);
function WindowResize() {
    const size = container.getBoundingClientRect();
    width = size.width;
    height = size.height;
    canvas.width = width;
    canvas.height = height;
    context.translate(0, height);
    context.scale(1, -1);
    Draw();
}
function ResizeArray() {
    arraySize = parseInt(sizeInput.value, 10);
    UpdateSpeed();
    array.Resize(arraySize);
    Draw();
}
function UpdateSpeed() {
    SortArray.actionCount = parseFloat(speedInput.value);
}
function ChangeMethod() {
    displayMethod = DrawMode[methodInput.value];
    Draw();
}
let running = false;
async function Run(sortFunc) {
    if (running) {
        return;
    }
    running = true;
    sizeInput.disabled = true;
    await array.Shuffle();
    await sortFunc(array);
    array.Clear();
    Draw();
    running = false;
    sizeInput.disabled = false;
}
function Draw() {
    const maxHighlight = 1;
    if (array.swapped.length > maxHighlight) {
        array.swapped.splice(10, array.compared.length - maxHighlight);
    }
    if (array.compared.length > maxHighlight) {
        array.compared.splice(10, array.compared.length - maxHighlight);
    }
    function setColor(index, val) {
        let sw = array.swapped.includes(index);
        let cp = array.compared.includes(index);
        /* if (sw && cp) {
            context.fillStyle = "#f0f";
        } else if (sw) {
            context.fillStyle = "#f00";
        } else if (cp) {
            context.fillStyle = "#00f";
        } else {
            context.fillStyle = "#fff";
        } */
        if (sw || cp) {
            context.fillStyle = context.strokeStyle = "#fff";
        }
        else {
            const col = hslToRgb(val / arraySize, 1, 0.5);
            context.fillStyle = context.strokeStyle = `rgb(${col[0]}, ${col[1]}, ${col[2]})`;
        }
    }
    context.clearRect(0, 0, width, height);
    let w = width / array.length;
    let h = height / array.length;
    context.strokeStyle = "#000";
    switch (displayMethod) {
        case DrawMode.Ramp:
            for (let i = 0; i < arraySize; i++) {
                const v = array.array[i];
                setColor(i, v);
                context.fillRect(Math.ceil(i * w), 0, Math.ceil(w), v * h);
            }
            break;
        case DrawMode.RampDots:
            for (let i = 0; i < arraySize; i++) {
                const v = array.array[i];
                setColor(i, v);
                let y = v * h;
                context.fillRect(Math.ceil(i * w), y, Math.ceil(w), Math.ceil(h));
            }
            break;
        case DrawMode.RampConnectedDots:
            for (let i = 0; i < arraySize - 1; i++) {
                const v = array.array[i];
                setColor(i, v);
                context.beginPath();
                context.moveTo(i * w, array.array[i] * h);
                context.lineTo((i + 1) * w, array.array[i + 1] * h);
                context.stroke();
                // context.fillRect(Math.ceil(i * w), y, Math.ceil(w), Math.ceil(h));
            }
            break;
        case DrawMode.Circle:
            for (let i = 0; i < arraySize; i++) {
                const v = array.array[i];
                setColor(i, v);
                let x = Math.cos((i / arraySize) * 2 * Math.PI) * 400 + width / 2;
                let y = Math.sin((i / arraySize) * 2 * Math.PI) * 400 + height / 2;
                let x1 = Math.cos(((i + 1) / arraySize) * 2 * Math.PI) * 400 + width / 2;
                let y1 = Math.sin(((i + 1) / arraySize) * 2 * Math.PI) * 400 + height / 2;
                context.lineWidth = 1;
                context.beginPath();
                context.lineTo(width / 2, height / 2);
                context.lineTo(Math.ceil(x), Math.ceil(y));
                context.lineTo(Math.ceil(x1), Math.ceil(y1));
                context.fill();
                // context.stroke();
                // context.fillRect(x, y, 1, 1);
            }
            break;
        case DrawMode.CircleDots:
            for (let i = 0; i < arraySize; i++) {
                const v = array.array[i];
                setColor(i, v);
                let x = Math.cos((i / arraySize) * 2 * Math.PI) * v * h / 2 + width / 2;
                let y = Math.sin((i / arraySize) * 2 * Math.PI) * v * h / 2 + height / 2;
                context.fillRect(x, y, 2, 2);
            }
            break;
        case DrawMode.Rect:
            for (let i = 0; i < arraySize; i++) {
                const v = array.array[i];
                setColor(i, v);
                context.fillRect(Math.ceil(i * w), 0, Math.ceil(w), height);
            }
            break;
    }
}
// requestAnimationFrame(Draw)
ResizeArray();
WindowResize();
//# sourceMappingURL=display.js.map