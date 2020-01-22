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
    tns(carouselConfig)
}

// instantiate accordions if any exist
const accordions = document.getElementsByClassName('Accordion');
if (accordions.length) {
    for(var i=0; i<accordions.length; i++) {
        const accordion = accordions[i];
        const triggers = accordion.querySelectorAll('.AccordionTrigger');
        if (triggers.length) {
            for(var j=0; j<triggers.length; j++) {
                triggers[j].addEventListener('click', (event) => {
                    const parentEl = event.target.parentElement;
                    const nextEl = event.target.nextElementSibling;
                    let hideNextEl;
                    if (nextEl && nextEl.classList.contains('AccordionContent')) {
                        hideNextEl = !nextEl.classList.contains('hide');
                    }

                    if (nextEl && parentEl && parentEl.classList.contains('Accordion')) {
                        // reset all
                        const allAccordionContent = parentEl.querySelectorAll('.AccordionContent'); 
                        if (allAccordionContent && allAccordionContent.length) {
                            for(var k=0; k<allAccordionContent.length; k++) {
                                allAccordionContent[k].classList.add('hide');
                            }
                        }
                        // select current
                        if (hideNextEl) {
                            nextEl.classList.add('hide');
                        } else {
                            nextEl.classList.remove('hide');
                        }
                    }
                })
            }
        }
    }
}
