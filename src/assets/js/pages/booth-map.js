import loadGoogleMapsApi from 'load-google-maps-api'
import axios from 'axios'
// import Awesomplete from 'awesomeplete'
import autocomplete from 'autocompleter'

let areas = null
let areaStyles = null
let booths = null
let map = null
let currentArea = null
let infoWindow = null
let gm = null

const loadAreas = () => {
    axios.get('/assets/static/archive/booth-areas.json')
        .then(res => {
            areas = res.data.areas
            areaStyles = res.data.styles
            console.log(areas)
            loadBooths()
        })
        .catch(err => {
            console.log(err)
        })
}

const loadBooths = () => {
    axios.get('/assets/static/archive/2019/booths.json')
        .then(res => {
            booths = res.data.booths
            console.log(booths)
            loadGoogleMaps()
        })
        .catch(err => {
            console.log(err)
        })
}

const loadGoogleMaps = () => {
    const config = {
        key: 'AIzaSyDWi99QHhJPRNMm_n8mbr0Ra9JdGcj8s6U'
    }
    loadGoogleMapsApi(config).then(googleMaps => {
        gm = googleMaps
        map = new gm.Map(document.getElementById('BoothMap'), {
            center: {
                lat: 33.7573884,
                lng: -84.359835
            },
            zoom: 17,
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{visibility: 'off'}]
                }
            ]
        })
        areas.forEach(area => {
            const paths = []
            area.points.forEach(point => {
                paths.push({lat: point[0], lng: point[1]})
            })
            area.styleObject = areaStyles[area.mode]
            area.styleObject.paths = paths

            const poly = new gm.Polygon(area.styleObject)
            area.polygon = poly
            poly.setMap(map)
        })

        initSearchInput()

    }).catch(error => {
        console.error('Google Maps Error')
        console.error(error)
    })
}

const initSearchInput = () => {
    const data = []
    booths.forEach(booth => {
        data.push({
            label: booth.business,
            value: booth.space
        })
        data.push({
            label: booth.contact,
            value: booth.space
        })
    })
    const INPUT_SELECTOR = '.BoothSearch-input'
    const input = document.querySelector(INPUT_SELECTOR)
    autocomplete({
        input: input,
        fetch: (text, update) => {
            const suggestions = data.filter(n => n.label.toLowerCase().includes(text.toLowerCase()))
            update(suggestions)
        },
        onSelect: item => {
            console.log(item)
            const input = document.querySelector(INPUT_SELECTOR)
            input.value = item.label
            selectBusinessOnMap(item.value)
        },
        emptyMsg: "no matches found"
    })
}

const matchesOddEven = (number, isEven) => {
    if (number%2 === 0) {
        return isEven
    } else {
        if (isEven) return false
        else return true
    }
}

const selectBusinessOnMap = number => {
    // find area for given booth number
    let selectedArea = null
    number = Number(number)
    for(var i=0; i<areas.length; i++) {
        const area = areas[i]
        // TODO needs to consider even/odd
        if (area.numbers[0] <= number && area.numbers[1] >= number) {
            if (matchesOddEven(number, area.even)) {
                selectedArea = area
                break
            }
        }
    }

    if (selectedArea) {
        if (currentArea) {
            currentArea.polygon.setOptions(currentArea.styleObject)
        }
        selectedArea.polygon.setOptions({ fillColor: '#000' })
        currentArea = selectedArea

        const booth = getBoothByNumber(number)

        let content = '<div class="BoothAreaInfo">'
        content += `${booth.business} / ${booth.contact} is booth ${booth.space} and can be found in this highlighted area.`
        content += '</div>'

        if (infoWindow) infoWindow.close()

        infoWindow = new gm.InfoWindow({ content })
        infoWindow.open(map)
        // infoWindow.setPosition({ lat: currentArea.points[0][0], lng: currentArea.points[0][1] })
        infoWindow.setPosition(currentArea.anchor)
        console.log(infoWindow)

    } else {
        console.error('no matching area found for ', number)
    }
}

const getBoothByNumber = number => {
    for(var i=0; i<booths.length; i++) {
        if (booths[i].space === number) {
            return booths[i]
        }
    }
    return null
}

loadAreas()



// const initAwesomplete = () => {
//     const data = []
//     booths.forEach(booth => {
//         data.push({
//             label: booth.business,
//             value: booth.space
//         })
//         data.push({
//             label: booth.contact,
//             value: booth.space
//         })
//     })
//     const input = document.querySelector('.BoothSearch-input.awesomplete')[0]
//     const bizComplete = new Awesomplete(input, { list: data })
//     input.addEventListener('awesomplete-select', onBizSelect)
// }
// const onBizSelect = (selection) => {
//     console.log(selection)
// }
