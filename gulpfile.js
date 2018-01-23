/// <binding ProjectOpened="watch" />
const gulp = require("gulp");
const concat = require("gulp-concat");
const eslint = require("gulp-eslint");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const install = require("gulp-install");
const closure = require("gulp-closure-compiler-service");
const del = require("del");

// Tasks.
gulp.task("scripts", function () {
    // Clean.
    del(['include/min']);

    gulp.src("include/*.js")
    .pipe(eslint())
    .pipe(sourcemaps.init())
	.pipe(concat("main.min.js"))
    //.pipe(babel({ presets: ["es2015"] }))
    //.pipe(closure({ compilation_level: "ADVANCED_OPTIMIZATIONS" }))
    .pipe(closure({ compilation_level: "SIMPLE_OPTIMIZATIONS" }))
	//.pipe(rename()) // ???
	.pipe(uglify())
    .pipe(sourcemaps.write("."))
	.pipe(gulp.dest("include/min"));
});

gulp.task("css", function () {
    // Clean.
    del(['css/min']);

    gulp.src("css/*.css")
	.pipe(concat("main.min.css"))
	.pipe(gulp.dest("css/min"));
});

gulp.task("install", function () {
    gulp.src(["./package.json"])
    .pipe(install());
});

gulp.task("eslint", function () {
    gulp.src("include/*.js")
    .pipe(eslint())
    .pipe(eslint.format())
    //.pipe(eslint.failOnError());
});

gulp.task("default", ["install", "scripts", "css"]);

gulp.task("watch", function () {
    // Watch .js files
    gulp.watch("include/*.js", ["scripts"]);
    // Watch .css files
    gulp.watch("css/*.css", ["css"]);
});

