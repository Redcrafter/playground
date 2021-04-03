function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

export default class Array {
    public static actionCount = 1;

    public swapped: number[] = [];
    public compared: number[] = [];

    private actions = 0;
    private array: number[] = [];
    private onDraw: () => void;

    public get length(): number {
        return this.array.length;
    }

    constructor(draw: () => void) {
        this.onDraw = draw;
    }

    public Resize(size: number) {
        this.array = [];

        for (let i = 0; i < size; i++) {
            this.array[i] = i + 1;
        }
    }

    public async Swap(first: number, second: number) {
        if (first < 0 || first >= this.length || second < 0 || second >= this.length) {
            throw new Error("Error Index out of bounds " + first + " " + second);
        }

        this.swapped.push(first, second);

        const tmp = this.array[first];
        this.array[first] = this.array[second];
        this.array[second] = tmp;

        await this.Draw();
    }
    public async Compare(first: number, second: number) {
        this.compared.push(first, second);

        await this.Draw();
        return this.array[first] - this.array[second];
    }
    public get(i: number) {
        return this.array[i];
    }

    public async Draw() {
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

    public Clear() {
        this.swapped = [];
        this.compared = [];
    }

    public async Shuffle() {
        for (let i = 0; i < this.array.length; i++) {
            await this.Swap(i, Math.floor(Math.random() * this.array.length));
        }

        this.swapped = [];
    }
}
