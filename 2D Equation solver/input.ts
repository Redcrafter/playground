export default class InputHandler {
    constructor(el: HTMLElement) {
        el.addEventListener("mousedown", this.mouseDown);
        el.addEventListener("mouseup", this.mouseUp);
        el.addEventListener("mousemove", this.mouseMove);
        el.addEventListener("wheel", this.mouseWheel, {
            passive: true,
        });

        let dragging = false;
        document.addEventListener("mouseup", () => {
            dragging = false;
        });

        el.addEventListener("mousedown", () => {
            dragging = true;
        });

        el.addEventListener("mousemove", (e) => {
            if (dragging) {
                this.mouseDrag(e);
            }
        });
    }

    protected mouseDown(e: MouseEvent) { }
    protected mouseUp(e: MouseEvent) { }
    protected mouseMove(e: MouseEvent) { }
    protected mouseDrag(e: MouseEvent) { }

    protected mouseWheel(e: MouseWheelEvent) { }
}
