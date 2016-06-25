const babelify = require("babelify");
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const eslint = require("gulp-eslint");
const fs = require("fs");
const gulp = require("gulp");
const cucumber = require("gulp-cucumber");
const less = require("gulp-less");
const mocha = require("gulp-mocha");
const runSequence = require("run-sequence");
const source = require("vinyl-source-stream");
const ts = require("gulp-typescript");
const tslint = require("gulp-tslint");
const uglify = require("gulp-uglify");

gulp.task("browserify", () => {
    const browsering = browserify(
        "src/site/scripts/main.js",
        {
            insertGlobals: true,
            debug: true
        });

    return browsering
        .transform("babelify", { presets: ["es2015"] })
        .bundle()
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest("src/site/scripts/bundled"));
});

gulp.task("eslint", () => {
    return gulp
        .src("test/**/*.js")
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("less", () => {
    return gulp.src("src/site/**/*.less")
        .pipe(less())
        .pipe(gulp.dest("src/site"));
});

gulp.task("lint", ["eslint", "tslint"], callback => callback());

gulp.task("test:unit", () => {
    return gulp.src("test/unit/tests.js")
        .pipe(mocha({
            reporter: "spec"
        }));
});

// Feature testing
// Todo #: Run these synchronously, and therefore as a part of the default tests
const featureTasks = (() => {
    function testFeature(feature) {
        return gulp.src(`test/integration/features/${feature}.feature`)
            .pipe(cucumber({
                "steps": `test/integration/steps/${feature}.js`,
                "support": `test/integration/support/${feature}.js`
            }));
    }

    const features = fs.readdirSync("test/integration/features")
        .map(fileName => fileName.replace(".feature", ""));

    features.forEach(feature => {
        gulp.task(
            `test:integration:${feature}`, 
            () => testFeature(feature));
    });

    return features.map(feature => `test:integration:${feature}`);
})();

gulp.task("test", callback => {
    runSequence(["test:unit"], callback);
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
    gulp.watch(["*.json", "src/**/*.ts","src/**/*.tsx"], ["tsc", "lint", "browserify"]);
    gulp.watch(["src/site/**/*.less"], ["less"]);
});

gulp.task("default", ["less", "tsc", "lint"], callback => {
    runSequence(["browserify", "test"], callback);
});

// Hack for hanging integration tests: https://github.com/gulpjs/gulp/issues/167
gulp.on("stop", () => {
    process.nextTick(() => process.exit(0));
});
