const browserify = require("browserify");
const gulp = require("gulp");
const cucumber = require("gulp-cucumber");
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

gulp.task("test:unit", () => {
    return gulp.src("test/unit/tests.js")
        .pipe(mocha({
            reporter: "spec"
        }));
});

gulp.task("test:integration", () => {
    return gulp.src("test/integration/features/*.feature")
        .pipe(cucumber({
            "steps": "test/integration/steps/*.js",
            "support": "test/integration/support/*.js"
        }));
});

gulp.task("test", callback => {
    runSequence(["test:unit", "test:integration"], callback);
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
    gulp.watch(["*.json", "src/**/*.ts","src/**/*.tsx"], ["tsc", "tslint", "browserify"]);
    gulp.watch(["src/site/**/*.less"], ["less"]);
});

gulp.task("default", ["less", "tsc", "tslint"], callback => {
    runSequence(["browserify", "test"], callback);
});

// Hack for hanging integration tests: https://github.com/gulpjs/gulp/issues/167
gulp.on("stop", () => {
    process.nextTick(() => process.exit(0));
});
