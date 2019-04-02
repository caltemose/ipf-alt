const fs = require('fs')
const csv = require('csv-parser')
const slug = require('slug')

const YEAR = '2019'

function readFile (url) {
    fs.createReadStream(url)
        .pipe(csv({ separator: '\t' }))
        .on('data', row => parseRow(row))
        .on('end', () => writeFiles())
}

function parseRow (row) {
    let key = ''

    let last = cleanField(row['Last Name'])
    if (notEmpty(last)) {
        key = last
    }

    let first = cleanField(row['First Name'])
    if (notEmpty(first)) {
        if (key.length) {
            key += '-'
        }
        key += first
    }

    let business = cleanField(row['Business Name'])
    if (notEmpty(business)) {
        if (key.length) {
            key += '-'
        }
        key += business
    }

    const area = row['Area'].toLowerCase()

    let vendor = { booths: [] }
    if (results[area][key]) {
        vendor = results[area][key]
    } else {
        results[area][key] = vendor
    }

    if (notEmpty(first)) {
        vendor.firstname = first
    }

    if (notEmpty(last)) {
        vendor.lastname = last
    }

    if (notEmpty(business)) {
        vendor.business = business
    }

    if (notEmpty(row['Category'])) {
        vendor.category = cleanCategory(row['Category'])
        vendor.class = makeClassFromCategory(vendor.category)
    }

    if (notEmpty(row['Booth'])) {
        vendor.booths.push(cleanField(row['Booth']))
    }

    if (notEmpty(row['Website'])) {
        const url = cleanUrl(row['Website'])
        if (url) vendor.url = url
    }
}

function writeFiles () {
    writeFile(results.ac, 'vendors-ac.json')
    writeFile(results.sm, 'vendors-sm.json')
    writeFile(results.cc, 'vendors-cc.json')
}

/*

HELPERS

 */

function defaultResults () {
    return {
        ac: {},
        cc: {},
        sm: {}
    }
}

function notEmpty (field) {
    return field.trim() != ''
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
    if (url == 'none' && url == 'n\/a') {
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

readFile('2019-vendors.tsv')
