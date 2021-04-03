export default class Complex {
    public re: number;
    public im: number;

    public get angle() {
        return Math.atan2(this.im, this.re);
    }
    public get length() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }

    constructor(re: number = 0, im: number = 0) {
        this.re = re;
        this.im = im;
    }

    public add(other: Complex) {
        return new Complex(this.re + other.re, this.im + other.im);
    }

    public sub(other: Complex) {
        return new Complex(this.re - other.re, this.im - other.im);
    }

    public mul(other: Complex) {
        return new Complex(
            this.re * other.re - this.im * other.im,
            this.re * other.im + this.im * other.re,
        );
    }

    public sin() {
        return new Complex(
            Math.sin(this.re) * Math.cosh(this.im),
            Math.cos(this.re) * Math.sinh(this.im),
        );
    }

    public pow(n: number) {
        const ang = this.angle;
        const mag = this.length;

        const a = mag ** n; // Math.exp(Math.log(mag * n));
        const b = n * ang;

        return new Complex(
            a * Math.cos(b),
            a * Math.sin(b),
        );
    }
}
