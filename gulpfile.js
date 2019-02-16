const { series, parallel, src, dest } = require('gulp')
const del = require('del')
const rollupEach = require('gulp-rollup-each')
const rollupBuble = require('rollup-plugin-buble')
const pug = require('gulp-pug')

function clean (cb) {
    return del('dist', cb)
}

function html () {
    return src('src/html/**/*')
        .pipe(dest('dist'))
}

function compilePug () {
    return src(['src/html/**/*.pug', '!src/html/_templates/**/*'])
        .pipe(pug())
        .pipe(dest('dist'))
}

function js () {
    return src([ 'src/js/pages/**/*.js' ])
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
        .pipe(dest('dist/js'))
}

function getNodeEnv () {
    return process.env.NODE_ENV || 'development'
}

function report(cb) {
    console.log('env', getNodeEnv())
    cb()
}

exports.clean = series(clean)

exports.build = series(
    clean,
    parallel(compilePug, js)
)
