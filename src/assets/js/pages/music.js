function init () {
    enableMusicSelector()
    enableBandButtons()
}

const hideElement = (el) => {
    el.style.display = 'none'
}

const showElement = (el) => {
    el.style.display = 'block'
}

function enableMusicSelector () {
    const selector = document.getElementById('musicSelector')
    selector.addEventListener('change', event => {
        window.location = '#' + event.target.value
    })
}

function enableBandButtons () {
    const triggers = document.getElementsByClassName('BandDetailsTrigger')
    for(var i=0; i<triggers.length; i++) {
        triggers[i].addEventListener('click', event => {
            const body = document.getElementsByTagName('body')
            body[0].classList.add('show-band-details')
            event.target.nextElementSibling.classList.add('band-is-shown')
            showElement(event.target.nextElementSibling)
        })
    }

    const closers = document.getElementsByClassName('BandDetails--close')
    for(var i=0; i<closers.length; i++) {
        closers[i].addEventListener('click', event => {
            const body = document.getElementsByTagName('body')
            body[0].classList.remove('show-band-details')
            const details = document.getElementsByClassName('band-is-shown')
            hideElement(details[0])
            details[0].classList.remove('band-is-shown')
        })
    }
}

init()
