export default class Complex {
    constructor(re = 0, im = 0) {
        this.re = re;
        this.im = im;
    }
    get angle() {
        return Math.atan2(this.im, this.re);
    }
    get length() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
    add(other) {
        return new Complex(this.re + other.re, this.im + other.im);
    }
    sub(other) {
        return new Complex(this.re - other.re, this.im - other.im);
    }
    mul(other) {
        return new Complex(this.re * other.re - this.im * other.im, this.re * other.im + this.im * other.re);
    }
    sin() {
        return new Complex(Math.sin(this.re) * Math.cosh(this.im), Math.cos(this.re) * Math.sinh(this.im));
    }
    pow(n) {
        const ang = this.angle;
        const mag = this.length;
        const a = mag ** n; // Math.exp(Math.log(mag * n));
        const b = n * ang;
        return new Complex(a * Math.cos(b), a * Math.sin(b));
    }
}
//# sourceMappingURL=Complex.js.map