interface IDict<T> {
    [key: string]: T;
}
let elements: IDict<HTMLElement> = {
    a: null,
    b: null,
    calc: null,
    out: null
};

let currentSelected: { a: HTMLElement, b: HTMLElement } = null;

for (const key in elements) elements[key] = document.getElementById(key);

elements.calc.addEventListener("click", calc);

function displayMatrix(a, b, matrix) {
    let width = b.length + 1;

    let table = document.createElement("table");

    {
        let tr = document.createElement("tr");
        tr.append(document.createElement("td"));
        tr.append(document.createElement("td"));

        for (let x = 0; x < b.length; x++) {
            let td = document.createElement("td");
            td.innerText = toText(b[x]);
            tr.append(td);
        }
        table.append(tr);
    }

    for (let y = 0; y <= a.length; y++) {
        let tr = document.createElement("tr");

        if (y == 0) {
            tr.append(document.createElement("td"));
        } else {
            let td = document.createElement("td");
            td.innerText = toText(a[y - 1]);
            tr.append(td);
        }

        for (let x = 0; x < width; x++) {
            let td = document.createElement("td");
            td.innerText = matrix[x + y * width].toString();
            tr.append(td);
        }

        table.append(tr);
    }

    elements.out.append(table);
}

function findMatch(a: number[], b: number[], matrix: ArrayLike<number>) {
    const width = b.length + 1;
    const height = a.length + 1;

    /*let max = matrix[0];
    let maxI = 0;
    for (let i = 1; i < matrix.length; ++i) {
        if (matrix[i] > max) {
            max = matrix[i];
            maxI = i;
        }
    }
    let maxX = maxI % width;
    let maxY = Math.floor(maxI / width);*/

    // let x = maxX;
    // let y = maxY;
    let x = width - 1;
    let y = height - 1;

    let aSeq: number[] = [];
    let bSeq: number[] = [];

    while (x > 0 && y > 0) {
        const l = matrix[(x - 1) + y * width];
        const t = matrix[x + (y - 1) * width];
        const tl = matrix[(x - 1) + (y - 1) * width];

        let nx = x;
        let ny = y;

        if (tl >= t && tl >= l) {
            nx--;
            ny--;
        } else if (t >= l) {
            ny--;
        } else {
            nx--;
        }

        bSeq.push(nx == x ? null : x - 1);
        aSeq.push(ny == y ? null : y - 1);

        x = nx;
        y = ny;
    }

    return [aSeq, bSeq];
}

function findNext(arr: number[], start: number) {
    for (let i = start; i < arr.length; i++) {
        if (arr[i] != null) return i;
    }

    return null;
}

function updateClick(a: HTMLElement, b: HTMLElement) {
    if (currentSelected) {
        currentSelected.a.classList.remove("selected");
        currentSelected.b.classList.remove("selected");
    }
    currentSelected = { a, b };

    a.classList.add("selected");
    b.classList.add("selected");
}

function displayMatch(a: number[], b: number[], matrix: ArrayLike<number>) {
    let [aVal, bVal] = findMatch(a, b, matrix);

    let aDiv = document.createElement("div");
    let bDiv = document.createElement("div");

    aDiv.classList.add("data");
    bDiv.classList.add("data");

    aVal.reverse();
    bVal.reverse();

    function label(arr: number[], i: number) {
        let off = document.createElement("span");
        off.classList.add("index");

        let ind = arr[i];
        if (ind == null) {
            let next = findNext(arr, i);

            debugger;
            ind = arr[next] - (next - i);
            // val = next - ((next - i) % 16);
            // val = 0;
        }

        off.innerText = ind.toString(16).padStart(4, "0");

        return off;
    }

    function step(ind: number, val: number) {
        let el = document.createElement("span");
        if (ind != null) el.innerText = toText(val);
        return el;
    }

    for (let i = 0; i < aVal.length; i++) {
        let aI = aVal[i];
        let bI = bVal[i];

        let aV = a[aI];
        let bV = b[bI];

        if (i % 16 == 0) {
            aDiv.append(label(aVal, i));
            bDiv.append(label(bVal, i));
        }

        let aEl = step(aI, aV);
        let bEl = step(bI, bV);

        if (aI != null && bI != null && aV != bV) {
            aEl.classList.add("diff");
            bEl.classList.add("diff");
        }
        if (aI == null && bI != null) bEl.classList.add("sub");
        if (bI == null && aI != null) aEl.classList.add("sub");

        aEl.onclick = () => updateClick(aEl, bEl);
        bEl.onclick = () => updateClick(aEl, bEl);

        aDiv.append(aEl);
        bDiv.append(bEl);
    }

    elements.out.append(aDiv, bDiv);
}

// https://en.wikipedia.org/wiki/Needleman-Wunsch_algorithm
function calcNeedleman(a: number[], b: number[]) {
    const width = b.length + 1;

    let matrix = new Int32Array((a.length + 1) * (b.length + 1));
    for (let x = 0; x <= b.length; x++) matrix[x] = -x;
    for (let y = 0; y <= a.length; y++) matrix[y * width] = -y;

    const match = 2;
    const mismatch = -1;
    const gap = -2;

    for (let y = 1; y <= a.length; y++) {
        let aVal = a[y];
        let yOff = y * width;

        for (let x = 1; x < width; x++) {
            let bVal = b[x];

            matrix[x + yOff] = Math.max(
                matrix[(x - 1) + (yOff - width)] + (aVal == bVal ? match : mismatch),
                matrix[(x - 1) + yOff] + gap,
                matrix[x + (yOff - width)] + gap
            );
        }
    }

    return matrix;
}

// https://en.wikipedia.org/wiki/Smith-Waterman_algorithm
function calcWaterman(a: number[], b: number[]) {
    const width = b.length + 1;
    let matrix = new Int32Array((a.length + 1) * (b.length + 1));

    const match = 1;
    const mismatch = -1;
    const gap = -1;

    for (let y = 1; y <= a.length; y++) {
        let aVal = a[y];
        let yOff = y * width;

        for (let x = 1; x < width; x++) {
            let bVal = b[x];

            matrix[x + yOff] = Math.max(
                matrix[(x - 1) + (yOff - width)] + (aVal == bVal ? match : mismatch),
                matrix[(x - 1) + yOff] + gap,
                matrix[x + (yOff - width)] + gap,
                0
            );
        }
    }

    return matrix;
}

function calc() {
    let a = elements.a.textContent.split("-").map(x => parseInt(x, 16));
    let b = elements.b.textContent.split("-").map(x => parseInt(x, 16));

    console.log(`Matrix size: ${(a.length + 1) * (b.length + 1) * 4} bytes`);

    let matrix = calcNeedleman(a, b);

    displayMatch(a, b, matrix);
    // displayMatrix(a, b, matrix);
}

function toText(val: number): string {
    return val.toString(16).padStart(2, "0");
    // return String.fromCharCode(val)
}
