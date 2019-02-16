export class Hello {
    constructor () {
        this.href = window.location.href
    }
    log () {
        console.log("Hello:", this.href)
    }
}