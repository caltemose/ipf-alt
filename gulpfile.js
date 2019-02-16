const fs = require('fs')
const { series, parallel, watch, src, dest } = require('gulp')
const changed = require('gulp-changed')
const del = require('del')
const rollupEach = require('gulp-rollup-each')
const rollupBuble = require('rollup-plugin-buble')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const browsersync = require('browser-sync').create()

//
// helpers
//

const getData = function() {
    const data = {};
    data.isProduction = isProductionEnv()
    data.globals = JSON.parse(fs.readFileSync('src/data/globals.json', 'utf8'));
    // data.music = JSON.parse(fs.readFileSync(config.tasks.html.dataFiles.music, 'utf8'));
    // data.vendors = {};
    // data.vendors.ac = JSON.parse(fs.readFileSync(config.tasks.html.dataFiles.vendors.ac, 'utf8'));
    // data.vendors.street = JSON.parse(fs.readFileSync(config.tasks.html.dataFiles.vendors.street, 'utf8'));
    // data.vendors.cc = JSON.parse(fs.readFileSync(config.tasks.html.dataFiles.vendors.cc, 'utf8'));
    return data;
}

function isProductionEnv () {
    return getNodeEnv() === 'production'
}

function getNodeEnv () {
    return process.env.NODE_ENV || 'development'
}

function report(cb) {
    console.log('env', getNodeEnv())
    cb()
}

//
// primary tasks
//

function clean (cb) {
    return del('dist', cb)
}

function html () {
    return src(['src/html/**/*.pug', '!src/html/_templates/**/*'])
        .pipe(pug({
            pretty: true,
            data: getData()
        }))
        .pipe(dest('dist'))
        .pipe(browsersync.stream())
}

function css () {
    return src('src/assets/css/**/*.sass')
        .pipe(sass({ indentedSyntax: true }))
        .pipe(autoprefixer({ browsers: ["last 3 version"] }))
        .pipe(dest('dist/assets/css'))
        .pipe(browsersync.stream())
}

function js () {
    return src([ 'src/assets/js/pages/**/*.js' ])
        .pipe(
            rollupEach(
                {
                    plugins: [
                        rollupBuble({ target: { ie: 11 } })
                    ],
                    isCache: true
                },
                { format: 'iife' }
            )
        )
        .pipe(dest('dist/assets/js'))
        .pipe(browsersync.stream())
}

function images () {
    return src('src/assets/img/**/*')
        .pipe(changed('dist/assets/img'))
        .pipe(dest('dist/assets/img'))
        .pipe(browsersync.stream())
}

function static () {
    return src('src/assets/static/**/*')
        .pipe(changed('dist/assets/static'))
        .pipe(dest('dist/assets/static'))
        .pipe(browsersync.stream())
}

function serve (cb) {
    browsersync.init({
        server: { baseDir: './dist' },
        port: 4040,
        notify: false,
        open: false
    })
    cb()
}

function watchAll () {
    watch('src/html/**/*.pug', html)
    watch('src/assets/css/**/*.sass', css)
    watch('src/assets/js/**/*.js', js)
    watch('src/assets/img/**/*', images)
    watch('src/assets/static/**/*', static)
}

//
// exported tasks
//

exports.clean = series(clean)

exports.build = series(
    clean,
    parallel(html, css, js, images, static)
)

exports.dev = series(
    exports.build, 
    series(serve, watchAll)
)

