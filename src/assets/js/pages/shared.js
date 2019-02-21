import { tns } from "tiny-slider/src/tiny-slider"

// handle the site hamburger menu
const menuToggle = document.getElementsByClassName('SiteMenuToggle')
if (menuToggle) {
    menuToggle[0].addEventListener('click', (menu) => {
        const body = document.getElementsByTagName('body')
        if (body) {
            body[0].classList.toggle('nav-open')
        }
    })
}

// instantiate carousels if any exist
const carouselConfig = {
    container: '.carousel',
    mode: 'carousel',
    slideBy: 'page',
    controls: false,
    navPosition: 'bottom'
}

const carousels = document.getElementsByClassName('carousel')
if (carousels.length) {
    const slider = tns(carouselConfig)
}
