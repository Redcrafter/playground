import SortArray from "./Array.js";

async function BogoSort(arr: SortArray) {
    let sorted = false;

    while (true) {
        sorted = true;

        for (let i = 1; i < arr.length; i++) {
            if (await arr.Compare(i - 1, i) > 0) {
                sorted = false;
                break;
            }
        }

        if (sorted) {
            break;
        }

        await arr.Shuffle();
    }
}

async function OddEvenSort(arr: SortArray) {
    let sorted = false;

    while (!sorted) {
        sorted = true;

        for (let i = 1; i < arr.length - 1; i += 2) {
            if (await arr.Compare(i, i + 1) > 0) {
                await arr.Swap(i, i + 1);
                sorted = false;
            }
        }

        for (let i = 0; i < arr.length - 1; i += 2) {
            if (await arr.Compare(i, i + 1) > 0) {
                await arr.Swap(i, i + 1);
                sorted = false;
            }
        }
    }
}

async function CocktailShakerSort(arr: SortArray) {
    for (let i = 0; i < arr.length / 2; i++) {
        for (let j = i; j < arr.length - i - 1; j++) {
            if (await arr.Compare(j, j + 1) > 0) {
                await arr.Swap(j, j + 1);
            }
        }
        for (let j = arr.length - i - 1; j > i; j--) {
            if (await arr.Compare(j, j - 1) < 0) {
                await arr.Swap(j, j - 1);
            }
        }
    }
}

async function CombSort(arr: SortArray) {
    const shrink = 1.3;
    let gap = arr.length;
    let sorted = false;

    while (!sorted) {
        gap = Math.floor(gap / shrink);

        if (gap <= 1) {
            gap = 1;
            sorted = true;
        }

        for (let i = 0; i + gap < arr.length; i++) {
            if (await arr.Compare(i, i + gap) > 0) {
                await arr.Swap(i, i + gap);
                sorted = false;
            }
        }
    }
}

async function HeapSort(arr: SortArray) {
    async function siftDown(s: number, e: number) {
        let root = s;
        let iLeft = 2 * root + 1;

        while (iLeft <= e) {
            let swap = root;

            if (await arr.Compare(swap, iLeft) < 0) {
                swap = iLeft;
            }
            if (iLeft + 1 <= e && await arr.Compare(swap, iLeft + 1) < 0) {
                swap = iLeft + 1;
            }
            if (swap === root) {
                break;
            }
            await arr.Swap(root, swap);
            root = swap;

            iLeft = 2 * root + 1;
        }
    }

    for (let s = Math.floor((arr.length - 1) / 2); s >= 0; s--) {
        await siftDown(s, arr.length - 1);
    }

    let end = arr.length - 1;
    while (end > 0) {
        arr.Swap(end, 0);
        end--;
        await siftDown(0, end);
    }
}

async function SelectionSort(arr: SortArray) {
    for (let i = 0; i < arr.length; i++) {
        let lowestIndex = i;

        for (let j = i; j < arr.length; j++) {
            if (await arr.Compare(j, lowestIndex) < 0) {
                lowestIndex = j;
            }
        }
        await arr.Swap(i, lowestIndex);
    }
}

async function DoubleSelectionSort(arr: SortArray) {
    let left = 0,
        right = arr.length - 1,
        smallest = 0,
        biggest = 0;

    while (left <= right) {
        for (let i = left; i <= right; i++) {
            if (await arr.Compare(i, biggest) > 0) {
                biggest = i;
            }
            if (await arr.Compare(i, smallest) < 0) {
                smallest = i;
            }
        }
        if (biggest === left) {
            biggest = smallest;
        }
        await arr.Swap(left, smallest);
        await arr.Swap(right, biggest);
        left++;
        right--;
        smallest = left;
        biggest = right;
    }
}

async function QuickSort(arr: SortArray) {
    async function Partition(start: number, end: number) {
        let i = start;
        let j = end - 1;

        while (true) {
            while (i < end && await arr.Compare(i, end) < 0) {
                i++;
            }
            while (j > start && await arr.Compare(j, end) > 0) {
                j--;
            }

            if (i < j) {
                await arr.Swap(i, j);
            } else {
                await arr.Swap(i, end);
                return i;
            }
        }
    }

    async function sort(p: number, r: number) {
        if (p < r) {
            const q = await Partition(p, r);

            await sort(p, q - 1);
            await sort(q + 1, r);
        }
    }

    await sort(0, arr.length - 1);
}

async function InsertionSort(arr: SortArray) {
    for (let i = 1; i < arr.length; i++) {
        let pos = i;
        while (pos > 0 && await arr.Compare(pos, pos - 1) <= 0) {
            await arr.Swap(pos, pos - 1);
            pos--;
        }
    }
}

async function GnomeSort(arr: SortArray) {
    let pos = 0;
    while (pos < arr.length) {
        if (pos === 0 || await arr.Compare(pos, pos - 1) > 0) {
            pos++;
        } else {
            await arr.Swap(pos, --pos);
        }
    }
}

async function BubbleSort(arr: SortArray) {
    for (let i = arr.length - 1; i > 0; i--) {
        for (let j = 0; j < i; j++) {
            if (await arr.Compare(j, j + 1) > 0) {
                await arr.Swap(j, j + 1);
            }
        }
    }
}

async function BinarySearchTreeSort(arr: SortArray) {
    class BinarySearchTree<T> {
        public left: BinarySearchTree<T> | undefined;
        public right: BinarySearchTree<T> | undefined;

        private node: T;
        private leftCount: number = 1;

        constructor(value: T) {
            this.node = value;
        }

        public Insert(item: T): number {
            if (item < this.node) {
                this.leftCount++;
                if (this.left === undefined) {
                    this.left = new BinarySearchTree(item);
                    return 0;
                } else {
                    return this.left.Insert(item);
                }
            } else {
                if (this.right === undefined) {
                    this.right = new BinarySearchTree(item);
                    return this.leftCount;
                } else {
                    return this.leftCount + this.right.Insert(item);
                }
            }
        }

        public ToArray(): T[] {
            const items: T[] = [];
            this.AddToArray(items);
            return items;
        }

        private AddToArray(array: T[]) {
            if (this.left !== undefined) {
                this.left.AddToArray(array);
            }
            array.push(this.node);
            if (this.right !== undefined) {
                this.right.AddToArray(array);
            }
        }
    }

    const copy = arr.array.slice();
    const tree = new BinarySearchTree(copy.shift());
    let i = 0;

    while (copy.length > 0) {
        const pos = tree.Insert(copy.shift());

        const tmp = tree.ToArray();
        arr.array = tmp.concat(copy);

        arr.swapped[0] = i;
        arr.swapped[1] = pos;
        await arr.Draw();

        i++;
    }
}

async function CircleSort(arr: SortArray) {
    async function circleSort(lo: number, hi: number, swaps: number) {
        if (lo === hi) {
            return swaps;
        }

        const high = hi;
        const low = lo;
        const mid = Math.floor((hi - lo) / 2);
        while (lo < hi) {
            if (await arr.Compare(lo, hi) > 0) {
                await arr.Swap(lo, hi);
                swaps++;
            }
            lo++;
            hi--;
        }
        if (lo === hi) {
            if (await arr.Compare(lo, hi + 1) > 0) {
                await arr.Swap(lo, hi + 1);
                swaps++;
            }
        }

        swaps = await circleSort(low, low + mid, swaps);
        swaps = await circleSort(low + mid + 1, high, swaps);

        return swaps;
    }

    while ((await circleSort(0, arr.length - 1, 0)) !== 0) { }
}

async function ShellSort(arr: SortArray) {
    const n = arr.length;
    let gap = 1;

    while (gap < (n >> 1)) {
        gap = (gap << 1) + 1;
    }

    while (gap > 0) {
        for (let i = gap; i < n; i++) {

            let k = i - gap;
            for (let j = i; j >= gap && await arr.Compare(j, k) < 0; ) {
                await arr.Swap(j, k);
                j = k;
                k -= gap;
            }
        }

        gap >>= 1;
    }
}

async function PancakeSort(arr: SortArray) {
    async function flip(num: number) {
        for (let i = 0; i < --num; i++) {
            await arr.Swap(i, num);
        }
    }

    for (let i = arr.length; i > 1; i--) {
        let maxNumPos = 0;
        for (let a = 0; a < i; a++) {
            if (await arr.Compare(a, maxNumPos) > 0) {
                maxNumPos = a;
            }
        }
        if (maxNumPos === i - 1) {
            continue;
        }
        if (maxNumPos > 0) {
            await flip(maxNumPos + 1);
        }
        await flip(i);
    }
}

async function CycleSort(arr: SortArray) {
    for (let cycleStart = 0; cycleStart < arr.length - 1; cycleStart++) {
        let pos;
        do {
            pos = cycleStart;
            for (let i = cycleStart + 1; i < arr.length; i++) {
                if (await arr.Compare(i, cycleStart) < 0) {
                    pos++;
                }
            }

            if (pos === cycleStart) {
                break;
            }

            while (await arr.Compare(pos, cycleStart) === 0) {
                pos++;
            }

            await arr.Swap(cycleStart, pos);
        } while (pos !== cycleStart);
    }
}

async function MergeSort(arr: SortArray) {
    async function sort(start: number, end: number) {
        if (end === start) {
            return;
        }

        let e = Math.floor((start + end) / 2);
        await sort(start, e);
        await sort(e + 1, end);

        let i = 0;
        let cop = new Array(end - start);

        let i1 = start;
        let i2 = e + 1;

        let el1 = arr.get(i1);
        let el2 = arr.get(i2);

        while (i < cop.length) {
            if (el1 < el2) {
                cop[i++] = el1;
                i1++;

                if (i1 <= e) {
                    el1 = arr.get(i1);
                } else {
                    for (; i2 <= end; i2++) {
                        cop[i++] = arr.get(i2);
                    }
                    break;
                }
            } else {
                cop[i++] = el2;
                i2++;

                if (i2 <= end) {
                    el2 = arr.get(i2);
                } else {
                    for (; i1 <= e; i1++) {
                        cop[i++] = arr.get(i1);
                    }
                    break;
                }
            }

            arr.swapped.push(i1);
            arr.swapped.push(i2);
            await arr.Draw();
        }

        i = 0;
        for (let j = start; j <= end; j++) {
            arr.array[j] = cop[i++];

            arr.swapped.push(j);
            await arr.Draw();
        }
    }

    await sort(0, arr.length - 1);
}

async function RadixLSD(arr: SortArray) {
    const radix = 4;
    let wr = arr.length / radix;

    function digit(a: number, power: number) {
        return Math.floor(a / Math.pow(radix, power)) % radix;
    }

    let biggest = -Infinity;
    for (let i = 0; i < arr.length; i++) {
        const el = arr.get(i);

        if (el > biggest) {
            biggest = el;
        }
    }

    let highestPower = Math.ceil(Math.log(biggest) / Math.log(radix));

    const buckets: number[][] = [];
    for (let i = 0; i < radix; i++) {
        buckets[i] = [];
    }

    for (let p = 0; p < highestPower; p++) {
        for (let i = 0; i < arr.length; i++) {
            const el = arr.get(i);

            buckets[digit(el, p)].push(el);

            arr.compared.push(i);
            await arr.Draw();
        }

        arr.maxMark = radix;
        arr.marked = [];

        let i = 0;
        for (let r = 0; r < radix; r++) {
            let b = buckets[r];
            while (b.length > 0) {
                arr.array[i++] = b.shift();

                await arr.Draw();
            }
        }
    }
}

interface IDict {
    [index: string]: (arr: SortArray) => Promise<void>;
}

let algos: IDict = {
    BogoSort,
    GnomeSort,
    InsertionSort,
    BubbleSort,
    CocktailShakerSort,
    SelectionSort,
    DoubleSelectionSort,

    BinarySearchTreeSort,
    CircleSort,
    CombSort,
    CycleSort,
    HeapSort,
    OddEvenSort,
    PancakeSort,
    QuickSort,
    ShellSort,
    MergeSort,

    RadixLSD
};

export default algos;
