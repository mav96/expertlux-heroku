import { src, dest, watch, parallel, series } from "gulp";
import babel from "gulp-babel";
import typescript from "typescript";
import ts from "gulp-typescript";
import rimraf from "gulp-rimraf";
import uglify from "gulp-uglify";
import cssmin from "gulp-cssmin";
import concat from "gulp-concat";
import sourcemaps from "gulp-sourcemaps";
import fs from "fs";

const environment = process.env.NODE_ENV || "development";
console.log(`environment: ${environment}`)

const clear = () => src("build", { read: false, allowEmpty: true }).pipe(rimraf({ force: true }));
const copy = (source, target) => src(source).pipe(dest(target));
const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json"));
tsconfig.compilerOptions.typescript = typescript;
const tsProject = ts.createProject(tsconfig.compilerOptions);
const serverCode = () => src(tsconfig.filesGlob)
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(tsProject()).js 
        .pipe(babel({
                presets: ["es2015", "stage-0"]
        }))
        // .pipe(concat('app.js'))
        .pipe(sourcemaps.write('./', { sourceRoot: "./" }))
        .pipe(dest(tsconfig.compilerOptions.outDir));
const serverViews = () => copy("src/views/**/*.html", "build/views");
const favicons = () => copy("src/content/favicons/**/*.*", "build/content/favicons");
const images = () => copy("src/content/images/**/*.*", "build/content/images");
const otherFiles = () => copy([
        "src/content/robots.txt",
        "src/content/humans.txt",
        "src/content/sitemap.xml"], "build/content");
const scripts = () => copy("src/content/scripts/**/*.js", "build/content/scripts");
const styles = () => copy("src/content/styles/**/*.css", "build/content/styles");
const scriptsMin = () => src("src/content/scripts/**/*.js", { base: '.' })
        .pipe(concat("app.min.js"))
        .pipe(uglify())
        .pipe(dest("build/content"));
const stylesMin = () => src("src/content/styles/**/*.css", { base: '.' })
        .pipe(concat("site.min.css"))
        .pipe(cssmin())
        .pipe(dest("build/content"));
const libs = () => copy([
        "bower_components/bootstrap/dist/css/bootstrap.css",
        "bower_components/bootstrap/dist/css/bootstrap.css.map",
        "bower_components/font-awesome/css/font-awesome.css"
], "build/content/libs")
const fonts = () => copy([
        "bower_components/font-awesome/fonts/*.*"
], "build/content/fonts")
const develop = series(clear, parallel(serverCode, serverViews, favicons, images, otherFiles, scripts, styles, libs, fonts));
const release = series(clear, parallel(serverCode, serverViews, favicons, images, otherFiles, scriptsMin, stylesMin));
const isRelease = () => environment != "development";
const build = isRelease() ? release : develop;
export { develop, release, build }
export default build;