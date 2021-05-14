export default class InputHandler {
    constructor(el) {
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
    mouseDown(e) { }
    mouseUp(e) { }
    mouseMove(e) { }
    mouseDrag(e) { }
    mouseWheel(e) { }
}
//# sourceMappingURL=input.js.map