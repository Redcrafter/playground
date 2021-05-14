import { hsvToRgb, rgbToHex } from "../helper.js";
let blockSize = 10;
let width = 0;
let height = 0;
let speed = 0;
let running = false;
let map;
let areaCount = 0;
const drawRoom = true;
const drawMaze = true;
const drawConnect = true;
const sizeInput = document.getElementById("size");
const roomsCheck = document.getElementById("rooms");
const roomInput = document.getElementById("roomCount");
const connCheck = document.getElementById("randConn");
const trimCheck = document.getElementById("trimLoose");
const exploreCheck = document.getElementById("explore");
const generateButton = document.getElementById("generate");
const randomizeButton = document.getElementById("randomize");
const randomCheck = document.getElementById("random");
const canvas = document.getElementById("main");
const elements = [sizeInput, roomsCheck, roomInput, connCheck, trimCheck, exploreCheck, generateButton, randomizeButton];
sizeInput.oninput = () => {
    blockSize = sizeInput.valueAsNumber;
};
roomsCheck.oninput = () => {
    roomInput.disabled = !roomsCheck.checked;
};
randomCheck.oninput = () => {
    if (randomCheck.checked) {
        startLoop();
    }
};
generateButton.onclick = generate;
randomizeButton.onclick = randomize;
window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let context = canvas.getContext("2d");
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}
function getCell(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) {
        return -1;
    }
    return map[x + y * width];
}
function setCell(x, y, val) {
    if (x >= 0 && y >= 0 && x < width && y < height)
        map[x + y * width] = val;
}
// create rooms
async function genRooms(tries) {
    const minSize = 3;
    const maxSize = Math.sqrt(width * height) / 10;
    // 1 is reserved for maze
    for (let i = 0; i < tries; i++) {
        const x = Math.floor(Math.random() * width / 2) * 2;
        const y = Math.floor(Math.random() * height / 2) * 2;
        const w = Math.floor(Math.random() * (maxSize / 2)) * 2 + minSize;
        const h = Math.floor(Math.random() * (maxSize / 2)) * 2 + minSize;
        if (x + w >= width || y + h >= height) {
            continue;
        }
        let ok = true;
        // check if the room touches any other rooms
        for (let y1 = y; ok && y1 < y + h; y1++) {
            for (let x1 = x; x1 < x + w; x1++) {
                const val = getCell(x1, y1);
                if (val != 0) {
                    ok = false;
                    break;
                }
            }
        }
        if (ok) {
            areaCount++;
            // draw room
            for (let y1 = y; y1 < y + h; y1++) {
                for (let x1 = x; x1 < x + w; x1++) {
                    setCell(x1, y1, areaCount);
                }
            }
            context.fillStyle = rgbToHex(hsvToRgb(areaCount / 10, 1, 0.75));
            context.fillRect(x * blockSize, y * blockSize, w * blockSize, h * blockSize);
            if (drawRoom) {
                await sleep(10);
            }
        }
    }
}
async function genMaze() {
    context.fillStyle = "#888";
    function getNeighbor(x, y) {
        let ret = [];
        // left
        if (getCell(x - 2, y) == 0) {
            ret.push([x - 2, y]);
        }
        // right
        if (getCell(x + 2, y) == 0) {
            ret.push([x + 2, y]);
        }
        // up
        if (getCell(x, y - 2) == 0) {
            ret.push([x, y - 2]);
        }
        // down
        if (getCell(x, y + 2) == 0) {
            ret.push([x, y + 2]);
        }
        return ret[Math.floor(Math.random() * ret.length)];
    }
    async function connect(sx, sy) {
        let stack = [
            [sx, sy]
        ];
        let i = 0;
        while (stack.length != 0) {
            let curr = stack[stack.length - 1];
            let last = stack[stack.length - 2];
            context.fillRect(curr[0] * blockSize, curr[1] * blockSize, blockSize, blockSize);
            setCell(curr[0], curr[1], areaCount);
            if (last) {
                let dx = curr[0] - last[0];
                let dy = curr[1] - last[1];
                context.fillRect((last[0] + dx / 2) * blockSize, (last[1] + dy / 2) * blockSize, blockSize, blockSize);
                setCell(last[0] + dx / 2, last[1] + dy / 2, areaCount);
            }
            let n = getNeighbor(curr[0], curr[1]);
            if (n) {
                stack.push(n);
            }
            else {
                stack.pop();
            }
            if (drawMaze) {
                i++;
                if (i == speed) {
                    i = 0;
                    await sleep(1);
                }
            }
            // await drawStep();
        }
    }
    for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
            if (getCell(x, y) == 0) {
                areaCount++;
                await connect(x, y);
            }
        }
    }
}
async function connect() {
    let connectors = [];
    context.fillStyle = "#f00";
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (getCell(x, y) != 0)
                continue;
            let t = getCell(x, y - 1);
            let r = getCell(x + 1, y);
            let b = getCell(x, y + 1);
            let l = getCell(x - 1, y);
            let v = [];
            if (t > 0) {
                v.push(t);
            }
            if (r > 0) {
                v.push(r);
            }
            if (b > 0) {
                v.push(b);
            }
            if (l > 0) {
                v.push(l);
            }
            if (v.length == 2 && v[0] != v[1]) {
                connectors.push({
                    pos: [x, y],
                    val: v
                });
                if (drawConnect) {
                    context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                    await sleep(1);
                }
            }
        }
    }
    let connected = new Set();
    connected.add(Math.floor(Math.random() * areaCount) + 1);
    context.fillStyle = "#888";
    while (connectors.length > 0) {
        const pos = Math.floor(Math.random() * connectors.length);
        const c = connectors[pos];
        let a = connected.has(c.val[0]);
        let b = connected.has(c.val[1]);
        if (a && b) {
            if (Math.random() < 1 / 50) {
                setCell(c.pos[0], c.pos[1], 1);
                context.fillRect(c.pos[0] * blockSize, c.pos[1] * blockSize, blockSize, blockSize);
            }
            else {
                context.clearRect(c.pos[0] * blockSize, c.pos[1] * blockSize, blockSize, blockSize);
            }
        }
        else if (a) {
            connected.add(c.val[1]);
            setCell(c.pos[0], c.pos[1], 1);
            context.fillRect(c.pos[0] * blockSize, c.pos[1] * blockSize, blockSize, blockSize);
        }
        else if (b) {
            connected.add(c.val[0]);
            setCell(c.pos[0], c.pos[1], 1);
            context.fillRect(c.pos[0] * blockSize, c.pos[1] * blockSize, blockSize, blockSize);
        }
        else {
            continue;
        }
        connectors.splice(pos, 1);
        if (drawConnect) {
            await sleep(1);
        }
    }
}
async function trim() {
    let ends = [];
    function check(x, y) {
        if (getCell(x, y) > 0) {
            let n = 0;
            if (getCell(x + 1, y) > 0)
                n++;
            if (getCell(x - 1, y) > 0)
                n++;
            if (getCell(x, y + 1) > 0)
                n++;
            if (getCell(x, y - 1) > 0)
                n++;
            if (n == 1) {
                ends.unshift([x, y]);
            }
        }
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            check(x, y);
        }
    }
    let i = 0;
    while (ends.length > 0) {
        let p = ends.pop();
        setCell(p[0], p[1], 0);
        context.clearRect(p[0] * blockSize, p[1] * blockSize, blockSize, blockSize);
        check(p[0] + 1, p[1]);
        check(p[0] - 1, p[1]);
        check(p[0], p[1] + 1);
        check(p[0], p[1] - 1);
        i++;
        if (i == speed) {
            i = 0;
            await sleep(1);
        }
    }
}
async function fill() {
    // context.clearRect(0,0, width * 5, height * 5);
    function draw() {
        // context.clearRect(0,0, width * 5, height * 5);
        context.fillStyle = "#000";
        context.fillRect(0, 0, width * blockSize, height * blockSize);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const val = getCell(x, y);
                if (val == 0 || val == Infinity) {
                }
                else if (val == 1) {
                    context.fillStyle = "#888";
                    context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                }
                else {
                    context.fillStyle = rgbToHex(hsvToRgb(0, 0, (val / depth) * 0.9 + 0.1));
                    context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                }
            }
        }
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (getCell(x, y) > 0) {
                setCell(x, y, Infinity);
            }
        }
    }
    let posStack = [];
    let newStack = [];
    // posStack.push([ Math.floor(width / 4) * 2, Math.floor(height / 4) * 2]);
    // setCell(Math.floor(width / 4) * 2, Math.floor(height / 4) * 2, 1);
    for (let i = 0; i < 10000; i++) {
        let x = Math.floor(Math.random() * width / 2) * 2;
        let y = Math.floor(Math.random() * height / 2) * 2;
        if (getCell(x, y) > 0) {
            posStack.push([x, y]);
            setCell(x, y, 1);
            break;
        }
    }
    let depth = 1;
    while (posStack.length > 0) {
        const el = posStack.pop();
        const x = el[0];
        const y = el[1];
        const v = getCell(x, y);
        if (getCell(x + 1, y) > v + 1) {
            newStack.push([x + 1, y]);
            setCell(x + 1, y, v + 1);
        }
        if (getCell(x - 1, y) > v + 1) {
            newStack.push([x - 1, y]);
            setCell(x - 1, y, v + 1);
        }
        if (getCell(x, y + 1) > v + 1) {
            newStack.push([x, y + 1]);
            setCell(x, y + 1, v + 1);
        }
        if (getCell(x, y - 1) > v + 1) {
            newStack.push([x, y - 1]);
            setCell(x, y - 1, v + 1);
        }
        if (posStack.length == 0) {
            if (newStack.length == 0) {
                break;
            }
            posStack = newStack;
            newStack = [];
            depth++;
            if (depth % speed == 0) {
                draw();
                await sleep(1);
            }
        }
    }
    draw();
}
function randomConnect() {
    for (let y = 1; y < height; y += 2) {
        for (let x = 1; x < width; x += 2) {
            if (getCell(x, y) == 0 && Math.random() < 1 / 500) {
                setCell(x, y, 1);
                context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
            }
        }
    }
}
function randomize() {
    let blockSize = Math.round((Math.random() * 10) + 5);
    sizeInput.valueAsNumber = blockSize;
    width = Math.floor(window.innerWidth / blockSize);
    height = Math.floor(window.innerHeight / blockSize);
    if (Math.random() < 0.5) {
        roomsCheck.checked = true;
        if (Math.random() < 0.2) {
            roomInput.value = 1000000;
        }
        else {
            roomInput.value = Math.floor(Math.sqrt(width * height));
        }
    }
    else {
        roomsCheck.checked = false;
    }
    roomInput.disabled = !roomsCheck.checked;
    connCheck.checked = Math.random() > 0.5;
    trimCheck.checked = Math.random() > 0.5;
    exploreCheck.checked = Math.random() > 0.5;
}
function setRunning(val) {
    running = val;
    for (const el of elements) {
        if (val) {
            el.old = el.disabled;
            el.disabled = true;
        }
        else {
            el.disabled = el.old;
        }
    }
}
async function generate() {
    setRunning(true);
    blockSize = sizeInput.valueAsNumber;
    let createRoom = roomsCheck.checked;
    let roomCount = roomInput.valueAsNumber;
    let _connect = connCheck.checked;
    let _trim = trimCheck.checked;
    let _explore = exploreCheck.checked;
    width = Math.floor(window.innerWidth / blockSize);
    height = Math.floor(window.innerHeight / blockSize);
    speed = Math.ceil(Math.sqrt(width * height) / 100);
    map = new Array(width * height).fill(0);
    areaCount = 0;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (createRoom) {
        await genRooms(roomCount);
        await genMaze();
        await connect();
    }
    else {
        await genMaze();
    }
    if (_connect) {
        randomConnect();
    }
    if (_trim) {
        await trim();
    }
    if (_explore) {
        await fill();
    }
    setRunning(false);
}
async function startLoop() {
    while (true) {
        if (running) {
            await sleep(2000);
            continue;
        }
        if (!randomCheck.checked) {
            break;
        }
        randomize();
        await generate();
        await sleep(2000);
    }
}
//# sourceMappingURL=index.js.map