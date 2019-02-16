export class Goodbye {
    constructor () {
        this.href = window.location.href
    }
    log () {
        console.log("Goodbye:", this.href)
    }
}