import { hsvToRgb } from "../helper.js";
import Complex from "./Complex.js";
import InputHandler from "./input.js";
let width = window.innerWidth;
let height = window.innerHeight;
let wh = width / 2;
let hh = height / 2;
let scale = 100;
const offset = new Complex(0, 0);
const canvas = document.getElementById("mainCanvas");
canvas.width = width;
canvas.height = height;
const context = canvas.getContext("2d");
const imageData = context.createImageData(width, height);
const imageDat = imageData.data;
function setPixel(x, y, r, g, b) {
    if (x < 0 || y < 0 || x > width || y > height) {
        return;
    }
    const pos = (x + y * width) * 4;
    imageDat[pos] = r & 0xFF;
    imageDat[pos + 1] = g & 0xFF;
    imageDat[pos + 2] = b & 0xFF;
    imageDat[pos + 3] = 255;
}
function test(n) {
    return n.pow(5).sub(n).sub(new Complex(1, 0));
    // return n.sin();
    // return new Complex(n.im * (Math.sin(n.re) + n.re * Math.cos(n.re)), n.re * Math.sin(n.re));
}
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}
function getColor(n) {
    const mag = sigmoid((n.length));
    const adj = (n.angle / (Math.PI * 2)) + 0.5;
    return hsvToRgb(adj, 1, mag);
    return [mag * 255, mag * 255, mag * 255];
}
let last = performance.now();
function draw(time) {
    // console.log(time - last);
    for (let i = 0; i < height; i++) {
        setPixel(i, i, 0, 0, 0);
    }
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const x1 = (x - wh) / scale + offset.re;
            const y1 = (y - hh) / scale + offset.im;
            const res = test(new Complex(x1, y1));
            const col = getColor(res);
            setPixel(x, y, col[0], col[1], col[2]);
            // const col = getColor(new Complex(x1, y1));
            // setPixel((res.re + wh) | 0, (res.im + hh) | 0, col[0], col[1], col[2]);
        }
    }
    last = time;
    context.putImageData(imageData, 0, 0);
    // requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
class Asdf extends InputHandler {
    mouseDrag(e) {
        offset.re -= e.movementX / scale;
        offset.im -= e.movementY / scale;
        requestAnimationFrame(draw);
    }
    mouseWheel(e) {
        if (e.deltaY < 0) {
            scale *= 1.5;
        }
        else {
            scale /= 1.5;
        }
        requestAnimationFrame(draw);
    }
}
const handler = new Asdf(canvas);
//# sourceMappingURL=main.js.map