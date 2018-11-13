
const gulp = require('gulp')
const runSequence = require('run-sequence')
const babel = require("gulp-babel");
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const px2rem = require('gulp-rem-plugin')

const htmlmin = require('gulp-htmlmin')
const imagemin = require('gulp-imagemin')
const cssmin = require('gulp-clean-css')
const uglify = require('gulp-uglify')

const browserSync = require('browser-sync').create()
const proxy = require('http-proxy-middleware')
const path = require('path')
const rm = require('rimraf').sync
const exists = require('fs').existsSync
const chalk = require('chalk')


const argv = process.argv
let file = (argv[2] && argv[2].replace(/^-*/g, '')) || './'
const filePath = path.resolve(__dirname, file)
const paths = {
  html: `${filePath}/*.html`,
  scripts: `${filePath}/src/**/*.js`,
  css: `${filePath}/src/**/*.{scss,sass,css}`,
  images: `${filePath}/src/**/*.{png,jpg,jpeg,ico,gif}`,
  lib: `${filePath}/src/lib/*.js`
};

if (!exists(filePath)) {
  console.log(chalk.red('项目不存在'))
  return
}
rm(path.join(process.cwd(), 'dist'));

const proxyOption = proxy('/api', {
  target: 'http://192.168.0.1',
  changeOrigin: true,
})

gulp.task('server', () => {
  browserSync.init({
    server: 'dist',
    middleware: [proxyOption]
  });
});

// 开启重刷新
gulp.task('reload', () => {
  return browserSync.reload();
})

gulp.task('html', () => {
  return gulp.src(paths.html)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'))
})

gulp.task('images', () => {
  return gulp.src(paths.images)
    .pipe(imagemin())
    .pipe(gulp.dest('dist'));
});

gulp.task('sass', () => {
  return gulp.src(paths.css)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(px2rem({ 'width_design': 750 }))
    .pipe(cssmin({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist'))
});

gulp.task('js', () => {
  return gulp.src(paths.scripts)
    .pipe(babel({
      presets: ['es2015', 'stage-3']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'))
});

gulp.task('js:lib', () => {
  return gulp.src(paths.lib)
    .pipe(gulp.dest('dist'))
});

gulp.task('watch', () => {
  gulp.watch(paths.css, () => runSequence('sass', 'reload'));
  gulp.watch(paths.html, () => runSequence('html', 'reload'));
  gulp.watch(paths.images, () => runSequence('images', 'reload'));
  gulp.watch(paths.scripts, () => runSequence('js', 'reload'));

});
gulp.task('default', () => runSequence(['sass', 'images', 'js', 'js:lib'], 'html', 'watch', 'server'));
