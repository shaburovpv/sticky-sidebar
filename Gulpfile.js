
const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const header = require('gulp-header');
const gutil = require('gulp-util');
const rollup = require('gulp-rollup');
const resolve =  require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const concat = require('gulp-concat');
const pkg = require('./package.json'); 

const banner = [
  '/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @author <%= pkg.author %>',
  ' * @license <%= pkg.license %>',
  '**/',
  '',
].join('\n');

gulp.task("babel", function(){
  return gulp.src("src/sticky-sidebar.js")
    .pipe(rename({ basename: 'sticky' }))
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task('bundle', ['babel'], function(){
  return gulp.src(['dist/sticky.js'])
    .pipe(sourcemaps.init())
    // transform the files here.
    .pipe(rollup({
      allowRealFiles: true,
      // any option supported by Rollup can be set here.
      input: ['./dist/sticky.js'],
      plugins: [ resolve(), commonjs() ],
      output: {
        format: 'umd',
        name: 'StickySidebar',
      }
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('uglify', ['bundle'], function(){
  return gulp.src(['src/ResizeSensor.js', 'dist/sticky.js'])
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest("dist/"));
});

gulp.task('banner', function(){
  return gulp.src(['dist/sticky.min.js'])
    .pipe(header(banner, {pkg}))
    .pipe(gulp.dest("dist/"));
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['default']);
});

gulp.task('default', ['uglify'], function() {
  gulp.start('banner');
});

