const fs = require('fs');
const parse = require('csv-parse');

const INPUT_FILE = '2020-vendors.tsv'

function parseRecord (record) {
    console.log(record);
}

const parser = parse({
    delimiter: '\t'
});

parser.on('readable', function () {
    let record;
    while(record = parser.read()) {
        parseRecord(record);
    }
});

parser.on('error', function (error) {
    console.error(error);
});

parser.on('end', function () {
    console.log('end');
});

fs.createReadStream(INPUT_FILE).pipe(parser);

