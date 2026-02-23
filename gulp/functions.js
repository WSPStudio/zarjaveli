import gulp from "gulp";
const { src, dest, series } = gulp;
import path from "path";
import fs from "fs";
import yargs from "yargs";
import { fontsCopy, fontsConvert, fontcss } from "./fonts.js";
import { paths, source_folder, project_folder, concatLibs, getFiles, showNavbar, variables } from "./settings.js";
import { hideBin } from "yargs/helpers";
import resize from "gulp-image-resize";
import rename from "gulp-rename";
import posthtml from "gulp-posthtml";
import realFavicon from "gulp-real-favicon";
import through2 from "through2";
import { globSync } from "glob";

//
//
//
//
// Обрезка изображений

export const resizeSettings = yargs(hideBin(process.argv))
  .option("mobile", {
    alias: "m",
    type: "boolean",
    default: false,
  })
  .option("percentage", {
    alias: "p",
    type: "number",
    default: null,
  })
  .option("width", {
    alias: "w",
    type: "number",
    default: null,
  })
  .option("folder", {
    alias: "f",
    type: "string",
    default: "",
  }).argv;

const basePath = resizeSettings.folder ? `src/assets/img/${resizeSettings.folder}` : "src/assets/img/resize";
const outputPath = resizeSettings._[1] ? `src/assets/img/${resizeSettings._[1]}` : basePath;

const resizeImg = () => {
  const resizeOptions = {
    cover: true,
    crop: false,
    upscale: true,
  };

  if (resizeSettings.percentage) {
    resizeOptions.percentage = resizeSettings.percentage;
  } else if (resizeSettings.width) {
    resizeOptions.width = resizeSettings.width;
  } else {
    resizeOptions.width = 1000;
  }

  return gulp
    .src(`${basePath}/**/*.{jpg,jpeg,png}`)
    .pipe(gulp.dest(resizeSettings.mobile ? basePath : `${basePath}/old`))
    .pipe(resize(resizeOptions))
    .pipe(
      rename(function (path) {
        if (resizeSettings.mobile) {
          path.basename += "_mobile";
        }
      })
    )
    .pipe(gulp.dest(outputPath));
};

gulp.task("resize", resizeImg);

//
//
//
//
// Фавикон

const favicon = () => {
  realFavicon.generateFavicon(
    {
      masterPicture: "src/assets/img/favicon.svg",
      dest: "src/assets/img/favicon",
      iconsPath: "/assets/img/favicon/",
      design: {
        ios: {
          pictureAspect: "noChange",
          assets: {
            ios6AndPriorIcons: false,
            ios7AndLaterIcons: false,
            precomposedIcons: false,
            declareOnlyDefaultIcon: true,
          },
        },
        desktopBrowser: {
          design: "raw",
        },
        windows: {
          pictureAspect: "noChange",
          backgroundColor: "#da532c",
          onConflict: "override",
          assets: {
            windows80Ie10Tile: false,
            windows10Ie11EdgeTiles: {
              small: false,
              medium: true,
              big: false,
              rectangle: false,
            },
          },
        },
        androidChrome: {
          pictureAspect: "noChange",
          themeColor: "#ffffff",
          manifest: {
            display: "standalone",
            orientation: "notSet",
            onConflict: "override",
            declared: true,
          },
          assets: {
            legacyIcon: false,
            lowResolutionIcons: false,
          },
        },
        safariPinnedTab: {
          pictureAspect: "silhouette",
          themeColor: "#5bbad5",
        },
      },
      settings: {
        scalingAlgorithm: "Mitchell",
        errorOnImageTooSmall: false,
        readmeFile: false,
        htmlCodeFile: false,
        usePathAsIs: false,
      },
      markupFile: "faviconData.json",
    },
    function () {}
  );
};

gulp.task("favicon", favicon);

//
//
//
//
// Бэкап

function getTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function cleanupTemp({ keepLast = 3, step = 3, max = 9 } = {}) {
  const dir = "temp";
  if (!fs.existsSync(dir)) return;

  const folders = fs
    .readdirSync(dir)
    .map((name) => ({
      name,
      time: fs.statSync(path.join(dir, name)).mtime.getTime(),
    }))
    .sort((a, b) => a.time - b.time);

  if (folders.length <= max) return;

  const keep = new Set();
  const total = folders.length;

  folders.slice(-keepLast).forEach((f) => keep.add(f.name));

  for (let i = 0; i < total - keepLast; i++) {
    if ((i + 1) % step === 2) {
      keep.add(folders[i].name);
    }
  }

  if (keep.size > max) {
    const orderedKeep = folders.filter((f) => keep.has(f.name)).slice(-max);

    keep.clear();
    orderedKeep.forEach((f) => keep.add(f.name));
  }

  folders.forEach((f) => {
    if (!keep.has(f.name)) {
      fs.rmSync(path.join(dir, f.name), {
        recursive: true,
        force: true,
      });
    }
  });
}

export function temp() {
  if (project_folder === "template") {
    return Promise.resolve();
  }

  cleanupTemp({
    keepLast: 3, // сколько последних хранить
    step: 3, // помимо последних еще хранятся каждые step бэкапов
    max: 9, // максимум бэкапов для хранения
  });

  return src(`${source_folder}/**/*`, { dot: true }).pipe(dest(`temp/${getTimestamp()}`));
}

//
//
//
//
// Шрифты

const fonts = () => {
  return new Promise((resolve, reject) => {
    fs.writeFile(paths.src.fontcss, "", (err) => {
      if (err) return reject(err);

      fs.readdir(paths.src.fonts, (err, items) => {
        if (err) return reject(err);

        const fonts = items.filter((item) => /\.(woff2|woff|ttf|otf)$/i.test(item));

        if (!fonts.length) return resolve();

        Promise.all(
          fonts.map((item) => {
            return new Promise((res, rej) => {
              const fontname = path.parse(item).name;
              const style = fontname.split("-")[1];
              let weight = 400;

              switch (style) {
                case "Thin":
                  weight = 100;
                  break;
                case "ExtraLight":
                  weight = 200;
                  break;
                case "Light":
                  weight = 300;
                  break;
                case "Regular":
                  weight = 400;
                  break;
                case "Medium":
                  weight = 500;
                  break;
                case "SemiBold":
                  weight = 600;
                  break;
                case "Bold":
                  weight = 700;
                  break;
                case "ExtraBold":
                  weight = 800;
                  break;
                case "Black":
                  weight = 900;
                  break;
              }

              const fontFace = dedent(`
                @font-face {
                  font-family: '${fontname.split("-")[0]}';
                  src: url('../fonts/${fontname}.woff2');
                  font-weight: ${weight};
                  font-style: normal;
                  font-display: block;
                }
              `);

              fs.appendFile(paths.src.fontcss, fontFace + "\n\n", (err) => (err ? rej(err) : res()));
            });
          })
        )
          .then(resolve)
          .catch(reject);
      });
    });
  });
};

gulp.task("fonts", fonts);

//
//
//
//
// Объединение библиотек

export const concat = () => {
  if (!concatLibs) return Promise.resolve();

  const headPath = "src/assets/html/head.html";
  const footPath = "src/assets/html/foot.html";

  let head = fs.readFileSync(headPath, "utf8");
  let foot = fs.readFileSync(footPath, "utf8");

  const headRe = /(^[ \t]*)<!-- Библиотеки -->[\s\S]*?\n\1<!-- Общие стили -->/m;
  const footRe = /(^[ \t]*)<!-- Библиотеки -->[\s\S]*?\n\1<!-- Общие скрипты -->/m;

  if (concatLibs) {
    head = head.replace(headRe, (_, indent) => [`${indent}<!-- Библиотеки -->`, `${indent}<link rel="preload" href="assets/css/vendor.css" as="style" onload="this.rel='stylesheet'">`, ``, `${indent}<!-- Общие стили -->`].join("\n"));

    foot = foot.replace(footRe, (_, indent) => [`${indent}<!-- Библиотеки -->`, `${indent}<script src="assets/js/vendor.js" defer></script>`, ``, `${indent}<!-- Общие скрипты -->`].join("\n"));

    fs.writeFileSync(headPath, head);
    fs.writeFileSync(footPath, foot);
    return Promise.resolve();
  }

  head = head.replace(headRe, (_, indent) => {
    const styles = globSync(paths.src.cssLibsFiles)
      .reverse()
      .map((file) => {
        const base = path.basename(file);
        const fileName = !concatLibs && base === "vendor.css" ? "swiper.css" : base;

        return `${indent}<link rel="preload" href="assets/css/${fileName}" as="style" onload="this.rel='stylesheet'">`;
      })
      .join("\n");

    return [`${indent}<!-- Библиотеки -->`, styles, ``, `${indent}<!-- Общие стили -->`].join("\n");
  });
  foot = foot.replace(footRe, (_, indent) => {
    const scripts = globSync(paths.src.jsLibsFiles)
      .reverse()
      .map((file) => {
        const base = path.basename(file);
        const fileName = !concatLibs && base === "vendor.js" ? "swiper.js" : base;

        return `${indent}<script src="assets/js/${fileName}" defer></script>`;
      })
      .join("\n");

    return [`${indent}<!-- Библиотеки -->`, scripts, ``, `${indent}<!-- Общие скрипты -->`].join("\n");
  });

  fs.writeFileSync(headPath, head);
  fs.writeFileSync(footPath, foot);

  return Promise.resolve();
};

gulp.task("concat", concat);

//
//
//
//
// Создание файлов

const cleanDir = (dir, allowed, ignore = []) => {
  const allowedSet = new Set(allowed);

  fs.readdirSync(dir).forEach((file) => {
    const name = file.split(".")[0].replace(/^_/, "");
    if (!allowedSet.has(name) && !ignore.includes(name)) {
      fs.unlinkSync(path.join(dir, file));
    }
  });
};

const appendImportsToBottom = (filePath, imports) => {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");

  const lines = content.split("\n");

  // оставляем всё до первого динамического @import
  const cleaned = [];
  for (const line of lines) {
    if (/^@import\s+["'](_|components\/_)/.test(line.trim())) break;
    cleaned.push(line);
  }

  const base = cleaned.join("\n").trimEnd();

  const result = imports.length ? `${base}\n\n${imports.join("\n")}\n` : `${base}\n`;

  fs.writeFileSync(filePath, result);
};

export function dedent(str) {
  const lines = str.split("\n");

  while (lines[0]?.trim() === "") lines.shift();
  while (lines[lines.length - 1]?.trim() === "") lines.pop();

  const minIndent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));

  return lines.map((l) => l.slice(minIndent)).join("\n");
}

const create = () => {
  /* ---------------- HTML ---------------- */
  const htmlTpl = dedent(`
    @@include('assets/html/head.html', {
    "class": ""
    })
    @@include("assets/html/crumbs.html", {
    "list": [{
    "title":"Контакты",
    "link":"#"
    }]
    })

    @@include('assets/html/foot.html')
  `);

  getFiles.html.sort().forEach((name) => {
    const file = `${paths.src.htmlFiles}${name}.html`;
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, htmlTpl);
    }
  });

  /* ---------------- SASS: components ---------------- */

  const componentsImports = getFiles.components.sort().map((name) => `@import "components/_${name}"`);

  appendImportsToBottom(`${source_folder}/assets/sass/components.sass`, componentsImports);

  cleanDir(paths.src.sassComponents, getFiles.components, ["burger"]);

  /* ---------------- SASS: blocks ---------------- */

  const skip = new Set(["style", "fonts", "all", "components"]);

  const blocksImports = getFiles.sass
    .filter((name) => !skip.has(name))
    .sort()
    .map((name) => `@import "_${name}"`);

  appendImportsToBottom(`${source_folder}/assets/sass/blocks.sass`, blocksImports);

  /* ---------------- SASS files ---------------- */

  getFiles.sass.forEach((name) => {
    const file = `${paths.src.sass}_${name}.sass`;
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, `//.${name}\n`);
    }
  });

  /* ---------------- JS components ---------------- */

  const js = getFiles.jsScripts;
  const imports = js.map((name) => `import { ${name} } from './components/${name}'`).join("\n");
  const calls = js.map((name) => `${name}()`).join("\n");

  fs.writeFileSync(`${source_folder}/assets/js/components.js`, `${imports}\n\n${calls}\n`);

  /* ---------------- JS libs ---------------- */

  const VENDOR_PATH = path.join(paths.src.jsLibs, "vendor.js");
  const SWIPER_BLOCK =
    `\n` +
    dedent(`
    import Swiper from "swiper";
    import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
    Swiper.use([Navigation, Pagination, Autoplay, EffectFade]);
    window.Swiper = Swiper;
  `);

  let lines = [];

  getFiles.jsLibs.forEach((lib) => {
    if (lib === "swiper") {
      lines.push(SWIPER_BLOCK);
    } else {
      lines.push(`import "./${lib}.js";`);
    }
  });

  const SWIPER_COMMENT =
    `\n` +
    dedent(`
    /*
    // Autoplay; 					// автопрокрутка
    // EffectFade; 				// эффект fade
    // Keyboard; 					// управление клавишами
    // Navigation; 				// стрелки Next/Prev
    // Pagination; 				// bullets, fraction, progressbar
    // Controller; 				// связывание нескольких слайдеров
    // FreeMode; 					// свободное пролистывание
    // Grid; 							// сетка слайдов
    // Lazy; 							// lazy-load изображений
    // Mousewheel; 				// управление колесиком мыши
    // PaginationDynamic; // динамические bullets
    // Scrollbar; 				// scroll bar
    // Thumbs; 						// миниатюры (thumbnails)
    // A11y; 							// accessibility (a11y)
    // EffectCube; 				// 3D-куб
    // EffectFlip; 				// 3D-flip
    // EffectCoverflow; 	// эффект coverflow
    // History; 					// управление браузерной историей
    // HashNavigation; 		// навигация по hash
    // Manipulation; 			// add/remove slides dynamically
    // Parallax; 					// parallax эффект
    // Virtual; 					// виртуальные слайды
    // Zoom; 							// zoom
    */
  `);
  lines.push(SWIPER_COMMENT);

  fs.writeFileSync(VENDOR_PATH, lines.join("\n"));

  /* ---------------- CSS libs ---------------- */

  const CSS_VENDOR_PATH = path.join(paths.src.cssLibs, "vendor.css");

  let cssLines = [];

  const CSS_SWIPER_BLOCK =
    `\n` +
    dedent(`
    @import "swiper/swiper.css";
    @import "swiper/modules/navigation.css";
    @import "swiper/modules/pagination.css";

    /* 
    @import "swiper/modules/free-mode.css";
    @import "swiper/modules/grid.css";
    @import "swiper/modules/parallax.css";
    @import "swiper/modules/scrollbar.css";
    @import "swiper/modules/thumbs.css"; 
    @import "swiper/modules/zoom.css";  
    */
  `);

  getFiles.cssLibs.forEach((lib) => {
    if (lib !== "swiper") {
      cssLines.push(`@import "${lib}.css";`);
    }
  });

  cssLines.push(CSS_SWIPER_BLOCK);

  const content = cssLines.join("\n");

  fs.writeFileSync(CSS_VENDOR_PATH, content);

  /* ---------------- CSS variables ---------------- */

  const v = variables;

  fs.writeFileSync(
    paths.src.cssvariables,
    dedent(`
      $active: ${v.active}
      $gray: ${v.gray}
      $text: ${v.text}
      $bg: ${v.bg}
      $border-radius: ${v.borderRadius}

      $minWidth: ${v.minWidth}
      $maxWidth: ${v.maxWidth}
      $containerWidth: ${v.containerWidth}
      $container: ${v.container}
      $firstBreakpoint: ${v.firstBreakpoint}
      $section_gap: ${v.section_gap}
      $burgerMedia: ${v.burgerMedia}

      $font: '${v.font}'
    `)
  );
};

gulp.task("create", gulp.series(concat, create));

//
//
//
//
// Создание карты сайта

const pageTitles = {
  index: "Главная",
  about: "О нас",
  blog: "Блог",
  brands: "Бренды",
  catalog: "Каталог",
  category: "Категории",
  compare: "Сравнение",
  contact: "Контакты",
  faq: "Вопрос-ответ",
  feedback: "Отзывы",
  license: "Лицензии",
  news: "Новости",
  production: "Продукция",
  project: "Проекты",
  "single-project": "Проект",
  services: "Услуги",
  search: "Поиск",
  "search-empty": "Поиск - ничего не найдено",
  "single-category": "Категория",
  "single-product": "Товар",
  "single-services": "Услуга",
  "single-news": "Статья",
  text: "Текстовая",
  vacancy: "Вакансии",
  video: "Видео",
  wishlist: "Избранное",
};

function sitemap(cb) {
  const htmlFiles = fs
    .readdirSync(paths.src.htmlFiles)
    .filter((file) => file.endsWith(".html") && file !== "sitemap.html")
    .map((file) => {
      const name = path.basename(file, ".html");
      return {
        file: file,
        name: name,
        title: pageTitles[name] || name,
        path: file === "index.html" ? `/${project_folder}` : file,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "ru"));

  const links = htmlFiles.map((page) => `<li><a target="_blank" href="${page.path}">${page.title}</a></li>`).join("\n\t\t\t\t");

  const sitemapContent = dedent(`
    @@include('assets/html/head.html', {
    "class": '""'
    })
    @@include("assets/html/crumbs.html", {
    "list": [{
    "title": "Карта сайта",
    "link": "'#'"
    }]
    })

    <!-- Карта сайта -->
    <div class="section">
      <div class="container">
        <div class="text-block">
          <ul>
            ${links}
            <li><a data-modal="modal-call">Заказать звонок</a></li>
            <li><a data-modal="modal-thank">Спасибо</a></li>
          </ul>
        </div>
      </div>
    </div>

    @@include('assets/html/foot.html')
  `);

  const sitemapPath = path.join("src", "sitemap.html");

  fs.writeFile(sitemapPath, sitemapContent.trim(), (err) => {
    if (err) return cb(err);

    console.log("\n\n ✅ Карта сайта создана \n\n\n");

    cb();
  });
}

gulp.task("sitemap", sitemap);

//
//
//
//
// Создание навигация по проету

export const devNav = () => {
  if (!showNavbar) {
    return through2.obj((file, _, cb) => cb(null, file));
  }

  const pages = [];

  return through2.obj(
    function transform(file, _, cb) {
      if (file.isNull() || path.extname(file.path) !== ".html") {
        cb(null, file);
        return;
      }

      const name = path.basename(file.path, ".html");

      pages.push({
        name,
        file,
      });

      cb(null, file);
    },

    function flush(cb) {
      pages.forEach(({ name, file }) => {
        const links = pages
          .map(({ name: pageName }) => {
            const title = pageTitles[pageName] || pageName;
            const active = pageName === name ? " is-active" : "";

            return `<a href="${pageName}.html" class="${active.trim()}">${title}</a>`;
          })
          .join("\n");

        const html = dedent(`
          <!-- DEV NAV START -->
          <style>
            .dev-nav {
              position: fixed;
              inset: 20px auto auto 0;
              z-index: 9999
            }
            .dev-nav__toggle {
              position: relative;
              width: 100px;
              height: 80px;
              cursor: pointer;
            }
            .dev-nav__toggle:before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              z-index: 3;
              background: #111;
              width: 12px;
              height: 100%;
              border-top-right-radius: 4px;
              border-bottom-right-radius: 4px;
              cursor: pointer;
            }
            .dev-nav__menu {
              position: absolute;
              top: 0;
              left: 6px;
              display: flex;
              flex-direction: column;
              gap: 8px;
              background: #111;
              border-top-right-radius: 4px;
              border-bottom-right-radius: 4px;
              translate: -110% 0 ;
              transition: translate .25s ease;
            }
            .dev-nav__menu a{
              padding: 8px 12px;
              color: #fff;
              font-size: 14px;
              white-space: nowrap;
              text-decoration: none;
              opacity: .75;
            } 
            .dev-nav__menu a.is-active{
              opacity: 1;
              font-weight: 600
            }
            .dev-nav:hover .dev-nav__menu{
              translate: 0 0;
            }
          </style>

          <div class="dev-nav">
            <div class="dev-nav__toggle"></div>
            <nav class="dev-nav__menu">
              ${links}
            </nav>
          </div>
          <!-- DEV NAV END -->
        `);

        file.contents = Buffer.from(file.contents.toString().replace("</body>", `${html}\n</body>`));
      });

      cb();
    }
  );
};

//
//
//
//
// Очистка страниц от неиспользуемых библиотек
export const cleanScripts = () => {
  if (!concatLibs) {
    return gulp
      .src(project_folder + "/*.html")
      .pipe(
        posthtml([
          (tree) => {
            const hasNode = (check) => {
              let found = false;

              tree.walk((node) => {
                if (!node || !node.tag) return node;

                if (check(node)) {
                  found = true;
                }

                return node;
              });

              return found;
            };

            const removeIfNot = (match, condition) => {
              if (!condition()) {
                tree.walk((node) => {
                  if (!node || !node.tag) return node;

                  if (node.tag === match.tag && node.attrs && Object.entries(match.attrs).every(([key, val]) => node.attrs[key] && val.test(node.attrs[key]))) {
                    return null;
                  }

                  return node;
                });
              }
            };

            const hasDynamic = () => hasNode((node) => node.attrs && Object.prototype.hasOwnProperty.call(node.attrs, "data-da"));
            const hasNotify = () => hasNode((node) => node.attrs && Object.prototype.hasOwnProperty.call(node.attrs, "data-notify"));
            const hasGallery = () => hasNode((node) => node.attrs && Object.prototype.hasOwnProperty.call(node.attrs, "data-gallery"));
            const hasViewer = () => hasNode((node) => node.attrs && Object.prototype.hasOwnProperty.call(node.attrs, "data-viewer"));
            const hasSwiper = () => hasNode((node) => node.attrs && node.attrs.class && node.attrs.class.includes("swiper"));
            const hasWow = () => hasNode((node) => node.attrs && node.attrs.class && node.attrs.class.includes("wow"));
            const hasInputDate = () => hasNode((node) => node.tag === "input" && node.attrs && node.attrs.class && node.attrs.class.includes("input-date"));
            const hasSelect = () => hasNode((node) => node.tag === "select");
            const hasTimer = () => hasNode((node) => node.attrs && node.attrs.class && node.attrs.class.includes("timer"));

            removeIfNot({ tag: "script", attrs: { src: /dynamic/ } }, hasDynamic);

            removeIfNot({ tag: "script", attrs: { src: /notify/ } }, hasNotify);

            removeIfNot({ tag: "script", attrs: { src: /lg/ } }, hasGallery);
            removeIfNot({ tag: "link", attrs: { href: /lg/ } }, hasGallery);

            removeIfNot({ tag: "script", attrs: { src: /viewer/ } }, hasViewer);
            removeIfNot({ tag: "link", attrs: { href: /viewer/ } }, hasViewer);

            removeIfNot({ tag: "script", attrs: { src: /swiper/ } }, hasSwiper);
            removeIfNot({ tag: "link", attrs: { href: /swiper/ } }, hasSwiper);

            removeIfNot({ tag: "script", attrs: { src: /wow/ } }, hasWow);
            removeIfNot({ tag: "link", attrs: { href: /animate/ } }, hasWow);

            removeIfNot({ tag: "script", attrs: { src: /date/ } }, hasInputDate);
            removeIfNot({ tag: "link", attrs: { href: /date/ } }, hasInputDate);

            removeIfNot({ tag: "script", attrs: { src: /select/ } }, hasSelect);
            removeIfNot({ tag: "link", attrs: { href: /select/ } }, hasSelect);

            removeIfNot({ tag: "script", attrs: { src: /timer/ } }, hasTimer);

            return tree;
          },
        ])
      )
      .pipe(
        through2.obj(function (file, _, cb) {
          if (file.isBuffer()) {
            let html = file.contents.toString();

            html = html.replace(/<\/script>\s*\n\s*\n\s*(<script)/g, "</script>\n\t$1");
            html = html.replace(/\n\s*\n\s*\n+/g, "\n\n");

            file.contents = Buffer.from(html);
          }

          cb(null, file);
        })
      )
      .pipe(gulp.dest(project_folder));
  }

  return Promise.resolve();
};

gulp.task("clean", cleanScripts);

function cb() {}

export { resizeImg, favicon, fonts, create, sitemap };
