const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const slug = require('slug')

const INPUT_FILE = '2020-vendors.tsv'
const GULP_PATH = '../../src/data/'
const YEAR = '2019'

var i = 0

function readFile (url) {
    fs.createReadStream(url)
        .pipe(csv({ separator: '\t', escape: '}' }))
        .on('data', row => parseRow(row))
        .on('end', () => writeFiles())
}

function parseRow (row) {
    // let key = ''

    let last = cleanField(row['Last name'])
    // if (notEmpty(last)) {
    //     key = last
    // }

    let first = cleanField(row['First name'])
    // if (notEmpty(first)) {
    //     if (key.length) {
    //         key += '-'
    //     }
    //     key += first
    // }

    let business = cleanField(row['Business name'])
    // if (notEmpty(business)) {
    //     if (key.length) {
    //         key += '-'
    //     }
    //     key += business
    // }

    const area = fixArea(row['Area'])

    let vendor = { booths: [] }

    if (notEmpty(first)) {
        vendor.firstname = first
    }

    if (notEmpty(last)) {
        vendor.lastname = last
    }

    if (notEmpty(business) && business.toLowerCase() !== 'n/a') {
        vendor.business = business
    }

    if (notEmpty(row['Medium'])) {
        vendor.category = cleanCategory(row['Medium'])
        vendor.class = makeClassFromCategory(vendor.category)
    }

    // vendor.booths = getBoothsFromRow(row)

    if (notEmpty(row['Website'])) {
        const url = cleanUrl(row['Website'])
        if (url) vendor.url = url
    }

    results[area].push(vendor)
}

function writeFiles () {
    console.log('ac', results.ac.length)
    console.log('sm', results.sm.length)
    console.log('cc', results.cc.length)
    writeFile(results.ac, path.resolve(__dirname, GULP_PATH + 'vendors-ac.json'))
    writeFile(results.sm, path.resolve(__dirname, GULP_PATH + 'vendors-sm.json'))
    writeFile(results.cc, path.resolve(__dirname, GULP_PATH + 'vendors-cc.json'))
}

/*

HELPERS

 */

function fixArea (area) {
    /*
    NON-JURIED SHOW = street market
    JURIED SHOW = arts & crafts
    COMMUNITY CORNER
    */
    const a = area.toLowerCase()
    return a === 'non-juried show' ? 'sm' : a === 'juried show' ? 'ac' : 'cc'
}

function defaultResults () {
    return {
        ac: [],
        cc: [],
        sm: []
    }
}

function notEmpty (field) {
    return field && field.trim() != ''
}

function cleanField (field) {
    return field.trim()
}

function cleanUrl (url) {
    /*
    jmiguelfineart.com, jmiguel.com
    facebook:  EileenTantilloFineArts
    tim@timboydart.com
    Instagram Marsha Marsha Jewelry
    instagram @vintagevannety
    Instagram - pinkribbonatlanta
    marygayemiller.com  https://m.facebook.com/Mary-Gaye-Miller-
    signmeupsigns.etsy.com, instagram.com/signmeupsigns
    www.diamondbackhats@gmail.com
     */
    url = url.trim().toLowerCase()

    // if it's an array separated by , set url = url.split(',')[0]
    const split = url.split(',')
    url = split[0]

    // reject illegals: "none", "n/a"
    if (url == 'none' || url == 'n\/a') {
        return null
    }

    // if it contains "@" and doesn't start with facebook or instagram, reject it
    if (url.includes('@')) {
        if (!url.startsWith('facebook') || !url.startsWith('instagram')) {
            return null
        }
    }

    // if it starts with facebook create a facebook search url if possible
    if (url.startsWith('facebook')) {
        return null
    }

    // if it starts with instagram create an instagram url if possible
    if (url.startsWith('instagram')) {
        return null
    }

    // if it doesn't start with 'http' prefix it with 'http://' and return it
    if (url.startsWith('http')) {
        return url.replace(/\s/g, '')
    } else {
        return 'http://' + url.replace(/\s/g, '')
    }

    return null
}

function cleanCategory (category) {
    // TODO lookup from list and convert messy stuff?
    return category.trim()
}

function makeClassFromCategory (category) {
    category = category.trim().toLowerCase()
    return slug(category)
}

function getBoothsFromRow (row) {
    const booths = []
    if (notEmpty(row['Booth 1'])) {
        booths.push(row['Booth 1'].trim())
        if (notEmpty(row['Booth 2'])) {
            booths.push(row['Booth 2'].trim())
            if (notEmpty(row['Booth 3'])) {
                booths.push(row['Booth 3'].trim())
            }
        }
    }
    return booths
}

function writeFile (data, file) {
    fs.writeFile(file, JSON.stringify(data, null, '  '), err => {
        if (err) {
            return console.log(err)
        }
    })
}

/*

Init

*/

let results = defaultResults()

readFile(path.resolve(__dirname, INPUT_FILE))
