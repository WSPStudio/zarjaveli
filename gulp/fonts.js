import gulp from "gulp";
const { src, dest } = gulp;
import { paths } from "./settings.js";

import fonter from "gulp-fonter";
import newer from "gulp-newer";

export function fontsCopy() {
  return src(`${paths.src.fonts}*.{woff,woff2}`).pipe(newer(paths.build.fonts)).pipe(dest(paths.build.fonts));
}

export function fontsConvert() {
  return src(`${paths.src.fonts}*.{ttf,otf}`)
    .pipe(
      newer({
        dest: paths.build.fonts,
        ext: ".woff2",
      })
    )
    .pipe(
      fonter({
        formats: ["woff2"],
      })
    )
    .pipe(dest(paths.build.fonts));
}

export function fontcss() {
  src(paths.src.fontcss).pipe(dest(paths.build.css));
}
