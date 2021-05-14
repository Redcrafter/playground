import { createCanvas, canvas, context } from "../framework.js";
createCanvas();
const mw = 25;
const mh = 25;
let posStack = [];
let curr = { x: 0, y: 0 };
let maze = new Uint8Array(mw * mh);
let currentState = mazeGen;
requestAnimationFrame(draw);
function mazeGen() {
    maze[curr.x + curr.y * mw] |= 1 /* Visited */;
    // find next cell
    let possible = [];
    // top
    if (curr.y > 0 && maze[curr.x + (curr.y - 1) * mw] == 0) {
        possible.push({ x: curr.x, y: curr.y - 1, dir: 0 });
    }
    // bottom
    if (curr.y + 1 < mh && maze[curr.x + (curr.y + 1) * mw] == 0) {
        possible.push({ x: curr.x, y: curr.y + 1, dir: 1 });
    }
    // left
    if (curr.x > 0 && maze[curr.x - 1 + curr.y * mw] == 0) {
        possible.push({ x: curr.x - 1, y: curr.y, dir: 2 });
    }
    // right
    if (curr.x + 1 < mw && maze[curr.x + 1 + curr.y * mw] == 0) {
        possible.push({ x: curr.x + 1, y: curr.y, dir: 3 });
    }
    if (possible.length == 0) {
        if (posStack.length == 0) {
            // done
            curr = { x: 0, y: 0 };
            for (let i = 0; i < mw * mh; i++) {
                maze[i] &= ~1 /* Visited */;
            }
            currentState = mazeSolve;
            return;
        }
        else {
            curr = posStack.pop();
        }
    }
    else {
        let next = possible[~~(Math.random() * possible.length)];
        switch (next.dir) {
            case 0: // top
                maze[next.x + next.y * mw] |= 4 /* BottomWall */;
                maze[curr.x + curr.y * mw] |= 2 /* TopWall */;
                break;
            case 1: // bottom
                maze[next.x + next.y * mw] |= 2 /* TopWall */;
                maze[curr.x + curr.y * mw] |= 4 /* BottomWall */;
                break;
            case 2: // left
                maze[next.x + next.y * mw] |= 16 /* RightWall */;
                maze[curr.x + curr.y * mw] |= 8 /* LeftWall */;
                break;
            case 3: // right
                maze[next.x + next.y * mw] |= 8 /* LeftWall */;
                maze[curr.x + curr.y * mw] |= 16 /* RightWall */;
                break;
        }
        posStack.push(curr);
        curr = next;
    }
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#fff";
    for (let x = 0; x < mw; x++) {
        for (let y = 0; y < mh; y++) {
            let v = maze[x + y * mw];
            if (v & 1 /* Visited */) {
                context.fillRect(x * 15, y * 15, 10, 10);
            }
            if (v & 16 /* RightWall */) {
                context.fillRect(x * 15 + 10, y * 15, 5, 10);
            }
            if (v & 4 /* BottomWall */) {
                context.fillRect(x * 15, y * 15 + 10, 10, 5);
            }
        }
    }
    context.fillStyle = "#00f";
    for (const pos of posStack) {
        let v = maze[pos.x + pos.y * mw];
        context.fillRect(pos.x * 15, pos.y * 15, 10, 10);
        if (v & 16 /* RightWall */) {
            context.fillRect(pos.x * 15 + 10, pos.y * 15, 5, 10);
        }
        if (v & 4 /* BottomWall */) {
            context.fillRect(pos.x * 15, pos.y * 15 + 10, 10, 5);
        }
    }
}
/*function GraphGen() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#fff";
    for (let x = 0; x < mw; x++) {
        for (let y = 0; y < mh; y++) {
            let v = maze[x + y * mw];

            context.fillStyle = "#fff";
            if (v & CellFlags.Visited) {
                context.fillRect(x * 15, y * 15, 10, 10);
            }

            if (v & CellFlags.RightWall) {
                context.fillRect(x * 15 + 10, y * 15, 5, 10);
            }
            if (v & CellFlags.BottomWall) {
                context.fillRect(x * 15, y * 15 + 10, 10, 5);
            }

            let wallCount =
                ((v & CellFlags.TopWall) != 0) +
                ((v & CellFlags.BottomWall) != 0) +
                ((v & CellFlags.LeftWall) != 0) +
                ((v & CellFlags.RightWall) != 0);

            if (wallCount >= 3) {
                context.fillStyle = "#00f";
                context.fillRect(x * 15, y * 15, 10, 10);
            }
        }
    }
}*/
function mazeSolve() {
    maze[curr.x + curr.y * mw] |= 1 /* Visited */;
    let val = maze[curr.x + curr.y * mw];
    let next;
    if (val & 4 /* BottomWall */ && !(maze[curr.x + (curr.y + 1) * mw] & 1 /* Visited */)) {
        next = { x: curr.x, y: curr.y + 1 };
    }
    else if (val & 16 /* RightWall */ && !(maze[curr.x + 1 + curr.y * mw] & 1 /* Visited */)) {
        next = { x: curr.x + 1, y: curr.y };
    }
    else if (val & 2 /* TopWall */ && !(maze[curr.x + (curr.y - 1) * mw] & 1 /* Visited */)) {
        next = { x: curr.x, y: curr.y - 1 };
    }
    else if (val & 8 /* LeftWall */ && !(maze[curr.x - 1 + curr.y * mw] & 1 /* Visited */)) {
        next = { x: curr.x - 1, y: curr.y };
    }
    if (next == undefined) {
        curr = posStack.pop();
    }
    else {
        posStack.push(curr);
        curr = next;
    }
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < mw; x++) {
        for (let y = 0; y < mh; y++) {
            let v = maze[x + y * mw];
            if (v & 1 /* Visited */) {
                context.fillStyle = "#f00";
            }
            else {
                context.fillStyle = "#fff";
            }
            context.fillRect(x * 15, y * 15, 10, 10);
            if (v & 16 /* RightWall */) {
                context.fillRect(x * 15 + 10, y * 15, 5, 10);
            }
            if (v & 4 /* BottomWall */) {
                context.fillRect(x * 15, y * 15 + 10, 10, 5);
            }
        }
    }
    context.fillStyle = "#0f0";
    for (const pos of posStack) {
        let v = maze[pos.x + pos.y * mw];
        context.fillRect(pos.x * 15, pos.y * 15, 10, 10);
        if (v & 16 /* RightWall */) {
            context.fillRect(pos.x * 15 + 10, pos.y * 15, 5, 10);
        }
        if (v & 4 /* BottomWall */) {
            context.fillRect(pos.x * 15, pos.y * 15 + 10, 10, 5);
        }
    }
}
function draw() {
    currentState();
    // TODO: draw maze
    requestAnimationFrame(draw);
}
//# sourceMappingURL=Maze.js.map