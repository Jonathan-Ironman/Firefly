var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

// Tasks.
gulp.task("scripts", function () {
	gulp.src("include/*.js")
	.pipe(concat("main.min.js"))
	.pipe(uglify())
	.pipe(gulp.dest("include/min"));
});

gulp.task("default", function () {
    gulp.run('scripts');
});