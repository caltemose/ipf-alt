import { tns } from "tiny-slider/src/tiny-slider"
// instantiate carousels if any exist
const carouselConfig = {
    container: '.carousel',
    mode: 'carousel',
    slideBy: 'page',
    controls: false,
    navPosition: 'bottom',
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayButton: false,
}

const carousels = document.getElementsByClassName('carousel')
if (carousels.length) {
    tns(carouselConfig)
}
