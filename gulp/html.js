import gulp from "gulp";
const { src, dest } = gulp;
import path from "path";
import fs from "fs";
import { paths, isWp, isDev, isBuild } from "./settings.js";
import { dedent, devNav } from "./functions.js";
import fileinclude from "gulp-file-include";
import notify from "gulp-notify";
import gulpif from "gulp-if";
import beautify from "gulp-beautify";
import resize from "gulp-image-resize";
import rename from "gulp-rename";
import through from "through2";

const defaultMobileMedia = 575;
const mobileCache = new Set();

function createMobileVersion(originalPath, width = defaultMobileMedia) {
  const cacheKey = `${originalPath}_${width}`;
  if (mobileCache.has(cacheKey)) return Promise.resolve();

  const ext = path.extname(originalPath);
  const dir = path.dirname(originalPath);
  const base = path.basename(originalPath, ext);
  const mobilePath = path.join(dir, `${base}-${width}${ext}`);

  if (!fs.existsSync(mobilePath)) {
    mobileCache.add(cacheKey);

    return src(originalPath)
      .pipe(resize({ width }))
      .pipe(rename(`${base}-${width}${ext}`))
      .pipe(dest(dir));
  }

  mobileCache.add(cacheKey);
  return Promise.resolve();
}

export function html() {
  if (isWp) return Promise.resolve();

  return src(paths.src.html)
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
        context: { isDev: !isBuild },
      })
    )
    .on(
      "error",
      notify.onError({
        title: "HTML error",
        message: "<%= error.message %>",
        sound: false,
      })
    )
    .pipe(
      through.obj(function (file, enc, cb) {
        if (file._processed) return cb(null, file);
        file._processed = true;

        let content = file.contents.toString();
        content = content.replace(/<!-- not format -->/g, "");

        const imgRegex = /<img\b[^>]*>/gi;
        const imgTags = content.match(imgRegex) || [];
        const processQueue = [];

        imgTags.forEach((imgTag) => {
          const srcMatch = imgTag.match(/\bsrc="([^"]+\.(?:avif|webp|png|jpg|jpeg))"/i);
          if (!srcMatch) return;

          const imgSrc = srcMatch[1];
          const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(imgSrc);
          if (isAbsolute) return;

          const extFromHtml = path.extname(imgSrc).toLowerCase();
          const base = path.basename(imgSrc, extFromHtml);
          const dir = path.dirname(imgSrc);

          const picMatch = imgTag.match(/\spic(?:="([^"]*)")?/i);
          let picWidths = [defaultMobileMedia];

          if (picMatch && picMatch[1]) {
            picWidths = picMatch[1]
              .split(",")
              .map((v) => parseInt(v.trim(), 10))
              .filter((v) => !isNaN(v));
          }

          picWidths.sort((a, b) => b - a);

          const searchDir = path.join("src", dir);
          let foundPath = null;
          let originalExt = "";
          let isRaster = false;

          const availableExts = [".jpg", ".jpeg", ".png"];
          for (const e of availableExts) {
            const fullPath = path.join(searchDir, base + e);
            if (fs.existsSync(fullPath)) {
              foundPath = fullPath;
              originalExt = e;
              isRaster = true;
              break;
            }
          }

          if (foundPath) {
            picWidths.forEach((width) => {
              processQueue.push(createMobileVersion(foundPath, width));
            });
          }
        });

        Promise.allSettled(processQueue)
          .then(() => {
            content = content.replace(imgRegex, (imgTag) => {
              const srcMatch = imgTag.match(/\bsrc="([^"]+\.(?:avif|webp|png|jpg|jpeg))"/i);
              const dataSrcMatch = imgTag.match(/\bdata-src="([^"]+\.(?:avif|webp|png|jpg|jpeg))"/i);
              if (!srcMatch && !dataSrcMatch) return imgTag;

              const imgSrc = dataSrcMatch ? dataSrcMatch[1] : srcMatch ? srcMatch[1] : null;
              const useDataAttr = !!dataSrcMatch;

              const isAbsolute = /^(?:[a-z]+:)?\/\//i.test(imgSrc);
              if (isAbsolute) return imgTag;

              const extFromHtml = path.extname(imgSrc).toLowerCase();
              const base = path.basename(imgSrc, extFromHtml);
              const dir = path.dirname(imgSrc);

              const picMatch = imgTag.match(/\spic(?:="([^"]*)")?/);
              const picAttr = !!picMatch;

              let picWidths = [defaultMobileMedia];
              if (picMatch && picMatch[1]) {
                picWidths = picMatch[1]
                  .split(",")
                  .map((v) => parseInt(v.trim(), 10))
                  .filter((v) => !isNaN(v));
              }
              picWidths.sort((a, b) => b - a);

              const getAttr = (name) => {
                const m = imgTag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"));
                return m ? m[1] : null;
              };

              const classAttr = getAttr("class");
              const widthAttr = getAttr("width");
              const heightAttr = getAttr("height");
              const alt = getAttr("alt") || "";
              const loading = getAttr("loading");
              const loadingAttr = loading ? ` loading="${loading}"` : "";
              const decoding = getAttr("decoding") || "async";
              const fetchpriority = getAttr("fetchpriority");
              const fetchpriorityAttr = fetchpriority ? ` fetchpriority="${fetchpriority}"` : "";

              const searchDir = path.join("src", dir);
              let foundPath = null;
              let isRaster = false;

              const availableExts = [".jpg", ".jpeg", ".png"];
              for (const e of availableExts) {
                const fullPath = path.join(searchDir, base + e);
                if (fs.existsSync(fullPath)) {
                  foundPath = fullPath;
                  isRaster = true;
                  break;
                }
              }

              if (!isRaster || !foundPath) return imgTag;

              const placeholder = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

              const sources = [];

              if (picAttr) {
                picWidths.forEach((w) => {
                  const media = `(max-width: ${w}px)`;

                  if (isBuild) {
                    if (useDataAttr) {
                      sources.push(`<source srcset="${placeholder}" data-srcset="${path.join(dir, `${base}-${w}.avif`)}" type="image/avif" media="${media}">`);
                    } else {
                      sources.push(`<source srcset="${path.join(dir, `${base}-${w}.avif`)}" type="image/avif" media="${media}">`);
                    }
                  }

                  if (useDataAttr) {
                    sources.push(`<source srcset="${placeholder}" data-srcset="${path.join(dir, `${base}-${w}.webp`)}" type="image/webp" media="${media}">`);
                  } else {
                    sources.push(`<source srcset="${path.join(dir, `${base}-${w}.webp`)}" type="image/webp" media="${media}">`);
                  }
                });
              } else {
                if (isBuild) {
                  if (useDataAttr) {
                    sources.push(`<source srcset="${placeholder}" data-srcset="${path.join(dir, `${base}.avif`)}" type="image/avif">`);
                  } else {
                    sources.push(`<source srcset="${path.join(dir, `${base}.avif`)}" type="image/avif">`);
                  }
                }

                if (useDataAttr) {
                  sources.push(`<source srcset="${placeholder}" data-srcset="${path.join(dir, `${base}.webp`)}" type="image/webp">`);
                } else {
                  sources.push(`<source srcset="${path.join(dir, `${base}.webp`)}" type="image/webp">`);
                }
              }

              let imgFinal = `${base}.webp`;
              if (extFromHtml === ".avif") imgFinal = `${base}.avif`;
              if (extFromHtml === ".webp") imgFinal = `${base}.webp`;

              let imgHtml;

              if (useDataAttr) {
                imgHtml = `<img src="${placeholder}" data-src="${path.join(dir, imgFinal)}"${classAttr ? ` class="${classAttr}"` : ""}${widthAttr ? ` width="${widthAttr}"` : ""}${heightAttr ? ` height="${heightAttr}"` : ""} alt="${alt}"${loadingAttr} decoding="${decoding}" ${fetchpriorityAttr}>`;
              } else {
                imgHtml = `<img src="${path.join(dir, imgFinal)}"${classAttr ? ` class="${classAttr}"` : ""}${widthAttr ? ` width="${widthAttr}"` : ""}${heightAttr ? ` height="${heightAttr}"` : ""} alt="${alt}"${loadingAttr} decoding="${decoding}" ${fetchpriorityAttr}>`;
              }

              const finalHtml = dedent(`
              <picture>
                ${sources.join("\n    ")} 
                ${imgHtml}
              </picture>
            `);

              return finalHtml;
            });

            const manifestPath = path.join(paths.build.svgSprite, "sprite-manifest.json");

            if (fs.existsSync(manifestPath)) {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
              Object.keys(manifest).forEach((key) => {
                content = content.replaceAll(key, manifest[key]);
              });
            }

            file.contents = Buffer.from(content);
            cb(null, file);
          })
          .catch(cb);
      })
    )
    .pipe(isDev ? devNav() : through.obj())
    .pipe(
      gulpif(
        isBuild,
        beautify.html({
          indent_size: 2,
          max_preserve_newlines: 1,
        })
      )
    )
    .pipe(dest(paths.build.html));
}
