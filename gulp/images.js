import gulp from "gulp";
const { src, dest } = gulp;
import { paths, isBuild } from "./settings.js";
import mergeStream from "merge-stream";
import browsersync from "browser-sync";
import newer from "gulp-newer";
import webp from "gulp-webp";
import avif from "gulp-avif";
import gulpif from "gulp-if";

export function images() {
  const raster = (file) => /\.(jpe?g|png)$/i.test(file.path);

  const webpStream = src(paths.src.img)
    .pipe(gulpif(raster, newer({ dest: paths.build.img, ext: ".webp" })))
    .pipe(gulpif(raster, webp({ quality: 75 })))
    .pipe(dest(paths.build.img));

  const streams = [webpStream];

  if (isBuild) {
    const avifStream = src(paths.src.img)
      .pipe(gulpif(raster, newer({ dest: paths.build.img, ext: ".avif" })))
      .pipe(gulpif(raster, avif({ quality: 50, speed: 6 })))
      .pipe(dest(paths.build.img));

    streams.push(avifStream);
  }

  return mergeStream(...streams).on("end", () => {
    browsersync.reload();
  });
}
