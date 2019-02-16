const gulp = require('gulp')
const del = require('del')
const rollupEach = require('gulp-rollup-each')
const rollupBuble = require('rollup-plugin-buble')

gulp.task('clean', (done) => {
    return del('dist', done)
})
gulp.task('html', () => {
    return gulp
        .src('src/html/**/*')
        .pipe(gulp.dest('dist'))
})
gulp.task('js', () => {
    return gulp
        .src([
            'src/js/pages/**/*.js'
        ])
        .pipe(
            rollupEach(
                {
                    plugins: [
                        rollupBuble({ target: { ie: 11 } })
                    ],
                    isCache: true
                },
                {
                    format: 'iife'
                }
            )
        )
        .pipe(gulp.dest('dist/js'))
})
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'js')))

