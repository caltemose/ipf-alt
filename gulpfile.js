const fs = require('fs')
const { series, parallel, watch, src, dest } = require('gulp')
const changed = require('gulp-changed')
const gulpif = require('gulp-if')
const del = require('del')
const concat = require('gulp-concat')
const rollupEach = require('gulp-rollup-each')
const rollupBuble = require('rollup-plugin-buble')
const globals = require('rollup-plugin-node-globals')
const builtins = require('rollup-plugin-node-builtins')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const browsersync = require('browser-sync').create()
const imagemin = require('gulp-imagemin')
const cleanCSS = require('gulp-clean-css')
const uglify = require('gulp-uglify')

const _src = 'src/'
const _dest = 'dist'
const config = {
    port: 4040,
    src: _src,
    dest: _dest,
    data: {
        globals: _src + 'data/globals.json',
        music: _src + 'data/music.json',
        vendors: {
            ac: _src + 'data/vendors-ac.json',
            cc: _src + 'data/vendors-cc.json',
            street: _src + 'data/vendors-sm.json'
        }
    },
    pug: {
        src: [_src + 'html/**/*.pug', '!' + _src + 'html/_templates/**/*', '!' + _src + 'html/_includes/**/*'],
        options: { pretty: true }
    },
    sass: {
        src: _src + 'assets/css/**/*.sass',
        dest: _dest + '/assets/css'
    },
    autoprefixer: {
        options: { browsers: ["last 3 version"] }
    },
    jsPlugins: {
        src: _src + 'assets/js/plugins/**/*.js',
        filename: 'plugins.js',
        dest: _dest + '/assets/js',
    },
    js: {
        src: [ _src + 'assets/js/pages/**/*.js' ],
        dest: _dest + '/assets/js'
    },
    images: {
        src: _src + 'assets/img/**/*',
        dest: _dest + '/assets/img'
    },
    static: {
        src: _src + 'assets/static/**/*',
        dest: _dest + '/assets/static'
    },
    php: {
        src: [_src + 'html/**/*.php', '!' + _src + 'html/**/_*.php'],
        dest: _dest
    }
}

const ENV_DEV = 'development'
const ENV_STAGE = 'staging'
const ENV_PROD = 'production'


//
// helpers
//

const getData = function() {
    const data = {};
    data.isProduction = isProductionEnv()
    data.globals = JSON.parse(fs.readFileSync(config.data.globals, 'utf8'));
    data.music = JSON.parse(fs.readFileSync(config.data.music, 'utf8'));
    data.vendors = {};
    data.vendors.ac = JSON.parse(fs.readFileSync(config.data.vendors.ac, 'utf8'));
    data.vendors.street = JSON.parse(fs.readFileSync(config.data.vendors.street, 'utf8'));
    data.vendors.cc = JSON.parse(fs.readFileSync(config.data.vendors.cc, 'utf8'));
    return data;
}

function isProductionEnv () {
    return getNodeEnv() === ENV_PROD
}

function getNodeEnv () {
    return process.env.NODE_ENV || ENV_DEV
}

//
// primary tasks
//

function clean (cb) {
    return del(config.dest, cb)
}

function html () {
    const pugOptions = config.pug.options
    pugOptions.data = getData()
    return src(config.pug.src)
        .pipe(pug(pugOptions))
        .pipe(dest(config.dest))
        .pipe(browsersync.stream())
}

function css () {
    return src(config.sass.src)
        .pipe(sass({ indentedSyntax: true }))
        .pipe(autoprefixer(config.autoprefixer.options))
        .pipe(gulpif(isProductionEnv, cleanCSS({ compatibility: 'ie8' })))
        .pipe(dest(config.sass.dest))
        .pipe(browsersync.stream())
}

function js () {
    return src(config.js.src)
        .pipe(
            rollupEach(
                {
                    plugins: [
                        rollupBuble({ target: { ie: 11 } }),
                        resolve({
                            jsnext: true,
                            main: true,
                            browser: true
                        }),
                        commonjs(),
                        globals(),
                        builtins()
                    ],
                    isCache: true
                },
                { format: 'iife' }
            )
        )
        .pipe(gulpif(isProductionEnv, uglify()))
        .pipe(dest(config.js.dest))
        .pipe(browsersync.stream())
}

function images () {
    return src(config.images.src)
        .pipe(changed(config.images.dest))
        .pipe(gulpif(isProductionEnv, imagemin()))
        .pipe(dest(config.images.dest))
        .pipe(browsersync.stream())
}

function static () {
    return src(config.static.src)
        .pipe(changed(config.static.dest))
        .pipe(dest(config.static.dest))
        .pipe(browsersync.stream())
}

function php () {
    return src(config.php.src)
        .pipe(changed(config.php.dest))
        .pipe(dest(config.php.dest))
}

function serve (cb) {
    browsersync.init({
        server: { baseDir: './' + config.dest },
        port: config.port,
        notify: false,
        open: false
    })
    cb()
}

function watchAll () {
    watch(config.pug.src, html)
    watch(config.sass.src, css)
    watch(config.js.src, js)
    watch(config.images.src, images)
    watch(config.static.src, static)
    watch(config.php.src, php)
}

function minify () {
    return src(_dest + '/assets/js/home.js') // this can't be right...
        .pipe(uglify())
        .pipe(dest(_dest + '/assets/js/'))
}

//
// exported tasks
//

exports.build = series(
    clean,
    parallel(html, css, js, images, static, php)
)

exports.dev = series(
    exports.build,
    series(serve, watchAll)
)


// throwaway testing tasks

exports.clean = series(clean)
exports.markup = series(clean, html)
exports.js = series(clean, js)
exports.minify = series(minify)
exports.php = series(clean, php)
exports.css = series(clean, css)
