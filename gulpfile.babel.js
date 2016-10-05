import { src, dest, watch, parallel, series } from "gulp";
import babel from "gulp-babel";
import typescript from "typescript";
import ts from "gulp-typescript";
import rimraf from "gulp-rimraf";
import uglify from "gulp-uglify";
import cssmin from "gulp-cssmin";
import concat from "gulp-concat";
import fs from "fs";

const clear = () => src("build", { read: false, allowEmpty: true }).pipe(rimraf({ force: true }));
const copy = (source, target) => src(source).pipe(dest(target));
const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json"));
tsconfig.compilerOptions.typescript = typescript;
const tsProject = ts.createProject(tsconfig.compilerOptions);
const serverCode = () => src(tsconfig.filesGlob)
        .pipe(tsProject()).js
        .pipe(babel())
        .pipe(dest(tsconfig.compilerOptions.outDir));
const serverViews = () => copy("src/views/**/*.html", "build/views");
const favicons = () => copy("src/content/favicons/**/*.*", "build/content/favicons");
const images = () => copy("src/content/images/**/*.*", "build/content/images");
const otherFiles = () => copy(["src/content/robots.txt", "src/content/humans.txt"], "build/content");
const scripts = () => copy("src/content/scripts/**/*.js", "build/content/scripts");
const styles = () => copy("src/content/styles/**/*.css", "build/content/styles");
const scriptsMin = () => src("src/content/scripts/**/*.js", {base: '.'})
        .pipe(concat("app.min.js"))
        .pipe(uglify())
        .pipe(dest("build/content"));
const stylesMin = () => src("src/content/styles/**/*.css", {base: '.'})
        .pipe(concat("site.min.css"))
        .pipe(cssmin())
        .pipe(dest("build/content"));
const libs = () => copy([
        "bower_components/bootstrap/dist/css/bootstrap.css",
        "bower_components/font-awesome/css/font-awesome.css"
        ], "build/content/libs")
const fonts = () => copy([
        "bower_components/font-awesome/fonts/*.*"
        ], "build/content/fonts")
const develop = series(clear, parallel(serverCode, serverViews, favicons, images, otherFiles, libs, scripts, styles, fonts));
const release = series(clear, parallel(serverCode, serverViews, favicons, images, otherFiles, scriptsMin, stylesMin));
export default develop;
export {release}