import gulp from "gulp";
const { src, dest, parallel } = gulp;
import path from "path";
import fs from "fs";
import { paths, isDev, isBuild, concatLibs, __dirname } from "./settings.js";
import browsersync from "browser-sync";
import notify from "gulp-notify";
import concat from "gulp-concat";
import group_media from "gulp-group-css-media-queries";
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import uncss from "gulp-uncss";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import postcss from "gulp-postcss";
import postcssImport from "postcss-import";

const sass = gulpSass(dartSass);

function translateError(msg) {
  const translations = [
    ["Tabs and spaces may not be mixed", "Табуляции и пробелы нельзя смешивать"],
    ["Declarations may only be used within style rules", "Объявления допустимы только внутри CSS-правил"],
    ["Expected identifier", "Ожидался идентификатор"],
    ["Invalid CSS after", "Неверный CSS после"],
    ["Undefined mixin", "Неопределённый миксин"],
    ["argument(s)? required", "требуется аргумент(ы)"],
    ["Invalid property name", "Неверное имя свойства"],
    ["Unterminated string", "Незавершённая строка"],
    ["Invalid media query", "Неверный медиазапрос"],
    ["Mixin doesn't accept a content block.", "Mixin не принимает блок контента"],
  ];

  let translated = msg;

  for (const [eng, rus] of translations) {
    const regex = new RegExp(eng, "i");
    if (regex.test(translated)) {
      translated = translated.replace(regex, rus);
      break;
    }
  }

  return translated;
}

export function handleError(taskName) {
  return function (err) {
    const original = err.messageOriginal || err.message || "Неизвестная ошибка";
    const short = original.split("\n")[0];
    const translated = translateError(short);
    const file = err.relativePath || err.file || "Неизвестный файл";
    const line = err.line || "?";

    notify({
      title: `\n${taskName} ошибка`,
      message: `\n\n${translated}\n${file.split("src/assets/")[1]}\n${line} строка \n\n\n\n`,
      sound: true,
    }).write(err);

    this.emit("end");
  };
}

export function cssCommon() {
  return src(paths.src.sass + "common.sass")
    .pipe(sass({ outputStyle: "expanded" }).on("error", handleError("SASS")))
    .pipe(dest(paths.build.css))
    .pipe(browsersync.stream());
}

export function cssComponents() {
  return src(paths.src.sass + "components.sass")
    .pipe(sass({ outputStyle: "expanded" }).on("error", handleError("SASS")))
    .pipe(dest(paths.build.css))
    .pipe(browsersync.stream());
}

export function cssBlocks() {
  return src(paths.src.sass + "blocks.sass", { sourcemaps: isDev })
    .pipe(sass({ outputStyle: "expanded" }).on("error", handleError("SASS")))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(csso())
    .pipe(dest(paths.build.css, { sourcemaps: isDev }))
    .pipe(browsersync.stream({ match: "**/*.css" }));
}

export function css() {
  return src([paths.src.sass + "components.sass", paths.src.sass + "common.sass", paths.src.sass + "blocks.sass"])
    .pipe(sass({ outputStyle: "expanded" }).on("error", handleError("SASS")))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["ff >= 120", "chrome >= 120", "ios >= 14"],
        cascade: false,
      })
    )
    .pipe(
      csso({
        restructure: false,
      })
    )
    .pipe(concat("style.css"))
    .pipe(group_media())
    .pipe(gulp.dest(paths.build.css));
}

export function cssLibs() {
  const postcssPlugins = [
    postcssImport({
      path: ["node_modules"],
    }),
  ];

  if (concatLibs) {
    return src(paths.src.cssLibs + "vendor.css")
      .pipe(postcss(postcssPlugins))
      .pipe(
        csso({
          restructure: false,
          forceMediaMerge: false,
          comments: false,
          usage: { keyframes: false },
        })
      )
      .pipe(concat("vendor.css"))
      .pipe(dest(paths.build.css))
      .pipe(browsersync.stream());
  }

  src([paths.src.cssLibs + "*.css", "!" + paths.src.cssLibs + "vendor.css"])
    .pipe(dest(paths.build.css))
    .pipe(browsersync.stream());

  return src(paths.src.cssLibs + "vendor.css")
    .pipe(postcss(postcssPlugins))
    .pipe(
      csso({
        restructure: false,
        forceMediaMerge: false,
        comments: false,
        usage: { keyframes: false },
      })
    )
    .pipe(concat("swiper.css"))
    .pipe(dest(paths.build.css))
    .pipe(browsersync.stream());
}

export function deadCss(done) {
  const cssPaths = isBuild ? [path.join(paths.build.css, "style.css")] : [path.join(paths.build.css, "common.css"), path.join(paths.build.css, "components.css"), path.join(paths.build.css, "blocks.css")];

  const htmlFiles = fs.readdirSync(paths.build.html).filter((f) => f.endsWith(".html"));
  const missingFiles = cssPaths.filter((file) => !fs.existsSync(file));

  if (missingFiles.length) {
    console.log("❌ CSS файлы не найдены:");
    missingFiles.forEach((f) => console.log("  " + f));
    done();
    return;
  }

  const cssContent = cssPaths.map((file) => fs.readFileSync(file, "utf-8")).join("\n");

  function extractClasses(cssContent) {
    return [...new Set(Array.from(cssContent.matchAll(/\.([_a-zA-Z][_a-zA-Z0-9-]*)/g)).map((m) => m[1]))];
  }

  const cssClasses = extractClasses(cssContent);

  let htmlContent = "";
  htmlFiles.forEach((file) => {
    htmlContent += fs.readFileSync(path.join(paths.build.html, file), "utf-8");
  });

  const usedClasses = new Set(
    Array.from(htmlContent.matchAll(/class=["']([^"']+)["']/g))
      .flatMap((m) => m[1].split(/\s+/))
      .filter(Boolean)
  );

  const unusedClasses = cssClasses.filter((c) => !usedClasses.has(c));

  console.log("❌ Неиспользуемые классы:");
  unusedClasses.forEach((c) => console.log("  " + c));

  done();
}
