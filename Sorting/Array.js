function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
export default class Array {
    constructor(draw) {
        this.swapped = [];
        this.compared = [];
        this.actions = 0;
        this.array = [];
        this.onDraw = draw;
    }
    get length() {
        return this.array.length;
    }
    Resize(size) {
        this.array = [];
        for (let i = 0; i < size; i++) {
            this.array[i] = i + 1;
        }
    }
    async Swap(first, second) {
        if (first < 0 || first >= this.length || second < 0 || second >= this.length) {
            throw new Error("Error Index out of bounds " + first + " " + second);
        }
        this.swapped.push(first, second);
        const tmp = this.array[first];
        this.array[first] = this.array[second];
        this.array[second] = tmp;
        await this.Draw();
    }
    async Compare(first, second) {
        this.compared.push(first, second);
        await this.Draw();
        return this.array[first] - this.array[second];
    }
    get(i) {
        return this.array[i];
    }
    async Draw() {
        this.actions++;
        if (this.actions >= Array.actionCount) {
            this.actions = 0;
            this.onDraw();
            this.swapped.splice(0);
            this.compared.splice(0);
            let sleepTime = 16.66666;
            if (Array.actionCount < 1) {
                sleepTime *= 1 / Array.actionCount;
            }
            await sleep(sleepTime);
        }
    }
    Clear() {
        this.swapped = [];
        this.compared = [];
    }
    async Shuffle() {
        for (let i = this.array.length - 1; i > 0; i--) {
            await this.Swap(i, Math.floor(Math.random() * (i + 1)));
        }
        this.swapped = [];
    }
}
Array.actionCount = 1;
//# sourceMappingURL=Array.js.map