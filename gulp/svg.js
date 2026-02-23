import gulp from "gulp";
const { src, dest } = gulp;
import { paths, source_folder } from "./settings.js";
import browsersync from "browser-sync";

import svgSprite from "gulp-svg-sprite";
import cheerio from "gulp-cheerio";
import rev from "gulp-rev";

export function svg() {
  return src([source_folder + "/assets/icons/*.svg"])
    .pipe(
      cheerio({
        run: ($) => {
          $("[fill]").removeAttr("fill");
          $("[fill-opacity]").removeAttr("fill-opacity");
          $("[stroke]").removeAttr("stroke");
          $("[stroke-opacity]").removeAttr("stroke-opacity");
          $("[style]").removeAttr("style");
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
            example: false,
          },
        },
      })
    )
    .pipe(rev())
    .pipe(dest(paths.build.svgSprite))
    .pipe(
      rev.manifest("sprite-manifest.json", {
        merge: true,
      })
    )
    .pipe(dest(paths.build.svgSprite))
    .pipe(browsersync.stream());
}
