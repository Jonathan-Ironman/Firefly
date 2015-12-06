/// <binding ProjectOpened='watch' />
var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Tasks.
gulp.task("scripts", function () {
    gulp.src("include/*.js")
	.pipe(concat("main.min.js"))
    //.pipe(jshint())
	//.pipe(uglify())
	.pipe(gulp.dest("include/min"));
});

gulp.task("css", function () {
    gulp.src("css/*.css")
	.pipe(concat("main.min.css"))
	.pipe(gulp.dest("css/min"));
});

gulp.task("default", ['scripts', 'css']);

gulp.task('watch', function () {
    // Watch .js files
    gulp.watch('include/*.js', ['scripts']);
    // Watch .css files
    gulp.watch('css/*.css', ['css']);
});