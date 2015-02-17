var gulp = require('gulp');

var uglify = require('gulp-uglify');
var compass = require('gulp-compass');
var minifyCSS = require('gulp-minify-css');

gulp.task('vue', function () {
  gulp.src('./static/bower_components/vue/dist/vue.min.js')
    .pipe(gulp.dest('./static/scripts/dist/lib/'));
});

gulp.task('superagent', function () {
  gulp.src('./static/bower_components/superagent/superagent.js')
    .pipe(uglify())
    .pipe(gulp.dest('./static/scripts/dist/lib/'));
});

gulp.task('velocity', function () {
  gulp.src('./static/bower_components/velocity/velocity.min.js')
    .pipe(gulp.dest('./static/scripts/dist/lib/'));
});

gulp.task('k-tap', function () {
  gulp.src('./static/bower_components/k-tap/dist/k-tap.js')
    .pipe(gulp.dest('./static/scripts/dist/lib/'));
});

gulp.task('default', ['vue', 'superagent', 'velocity', 'k-tap'], function () {
  gulp.src('./static/stylesheets/src/**/*.css')
    .pipe(gulp.dest('./static/stylesheets/dist/'));

  gulp.src('./static/stylesheets/src/**/*.scss')
    .pipe(compass({
      sass: './static/stylesheets/src/',
      css: './static/stylesheets/temp/'
    }))
    .pipe(gulp.dest('./static/stylesheets/dist/'));

  gulp.src('./static/scripts/src/**/*.js')
    .pipe(gulp.dest('./static/scripts/dist/'));
});

gulp.task('production', ['vue', 'superagent', 'velocity', 'k-tap'], function () {
  gulp.src('./static/stylesheets/src/**/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest('./static/stylesheets/dist/'));
  
  gulp.src('./static/stylesheets/src/**/*.scss')
    .pipe(compass({
      sass: './static/stylesheets/src/',
      css: './static/stylesheets/temp/'
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./static/stylesheets/dist/'));

  gulp.src('./static/scripts/src/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./static/scripts/dist/'));
});