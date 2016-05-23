const browserify = require("browserify");
const gulp = require("gulp");
const less = require("gulp-less");
const mocha = require("gulp-mocha");
const runSequence = require("run-sequence");
const source = require("vinyl-source-stream");
const ts = require("gulp-typescript");
const tslint = require("gulp-tslint");

gulp.task("browserify", () => {
    const browsering = browserify(
        "src/site/scripts/main.js",
        {
            insertGlobals: true,
            debug: true
        });

    return browsering
        .bundle()
        .pipe(source("main.js"))
        .pipe(gulp.dest("src/site/scripts/bundled"));
});

gulp.task("less", () => {
    return gulp.src("src/site/**/*.less")
        .pipe(less())
        .pipe(gulp.dest("src/site"));
});

gulp.task("test", () => {
    return gulp
        .src("test/tests.js")
        .pipe(mocha({
            reporter: "spec"
        }));
});

gulp.task("tsc", () => {
    const tsProject = ts.createProject("tsconfig.json");

    return tsProject
        .src()
        .pipe(ts(tsProject))
        .js.pipe(gulp.dest("src"));
});

gulp.task("tslint", () => {
    return gulp
        .src(["src/**/*.ts", "src/**/*.tsx", "!src/**/*.d.ts"])
        .pipe(tslint())
        .pipe(tslint.report("verbose"));
});

gulp.task("watch", () => {
    gulp.watch(["*.json", "src/**/*.ts","src/**/*.tsx"], ["tsc", "tslint"]);
    gulp.watch(["src/site/**/*.less"], ["less"]);
});

gulp.task("default", ["less", "tsc", "tslint"], cb => {
    runSequence(["browserify", "test"], cb);
});
