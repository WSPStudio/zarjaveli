export let replaceScripts = true;
export let template = "wsp";
export let concatLibs = true;
export let jsBundler = "rollup"; // rollup или esbuild
export let unCSS = false;
export let isDeploy = true;
export let isWp = false;
export let showNavbar = false;

export let variables = {
  font: "Montserrat",
  active: "#007EC6",
  gray: "#DFE4EC",
  text: "#1D2428",
  bg: "#1D2428",
  borderRadius: "20px",
  minWidth: "320",
  maxWidth: "1920",
  containerWidth: "1166",
  container: "#{$containerWidth+px}",
  firstBreakpoint: "1300",
  section_gap: 80,
  burgerMedia: 991,
};

export let getFiles = {
  html: [
    // "about",
    // 'account',
    // 'action',
    // 'catalog',
    // 'categories',
    // "category",
    // 'checkout',
    // "contact",
    // "feedback",
    // "news",
    // 'payment',
    // 'search',
    // 'single-category',
    // "single-news",
    // 'single-product',
    // 'sitemap',
    // 'vacancy',
    // 'wishlist',
    // "text",
  ],
  sass: [
    // 'about',
    // 'advantages',
    // 'banner',
    // 'brands',
    // 'card',
    // 'catalog',
    // 'category',
    // 'callback',
    // 'certificate',
    // 'company',
    // 'contact',
    // 'document',
    // 'faq',
    // 'features',
    // 'feedback',
    // 'gallery',
    // 'info',
    // 'manager',
    // 'news',
    // 'offer',
    // 'partner',
    // 'popular',
    // 'price',
    // 'product',
    // 'project',
    // 'portfolio',
    // 'step',
    // 'service',
    // 'services',
    // 'why',
    // 'vacancy',
    // 'work'
  ],
  components: [
    // 'context',
    // 'checkbox',
    // 'crumbs',
    // 'gradient',
    // 'map',
    // 'pagination',
    // 'range',
    // 'rating',
    // 'search',
    // 'select',
    // 'spoller',
    // 'slider',
    // 'subMenu',
    // 'switch',
    // "text",
    // 'tooltip',
    // 'video',
  ],
  cssLibs: [
    // 'animate',
    // 'date',
    // 'lg',
    // 'lg-thumbnail',
    // 'lg-zoom',
    // 'lg-video',
    // "select",
    // "swiper",
    // "viewer",
  ],
  jsLibs: [
    // "a_jquery",
    "dynamic",
    // 'date',

    // "lg",
    // "lg-thumbnail",
    // "lg-zoom",

    // "lg-video",

    // "mask",
    // 'range',
    // 'notify',
    // 'select',
    // "swiper",
    // 'timer',
    // 'viewer',
    // 'wow',
  ],
  jsScripts: [
    "burger",
    // "context",
    // 'fixedMenu',
    // 'form',
    // 'gallery',
    // 'map',
    "modal",
    // 'numbers',
    // 'rating',
    // 'scroll',
    // 'showMore',
    // 'select',
    // 'slider',
    // 'spoller',
    // 'subMenu',
    // 'tab',
    // 'tooltip',
    // 'text',
    // 'video',
    // "viewer",
  ],
};

import path from "path";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
export const project_folder = path.basename(path.dirname(__dirname));
export const source_folder = "src";
export let paths = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/assets/css/",
    js: project_folder + "/assets/js/",
    img: project_folder + "/assets/img/",
    fonts: project_folder + "/assets/fonts/",
    svgSprite: project_folder + "/assets/img/",
    srcHtml: source_folder + "/assets/",
    srcCss: source_folder + "/assets/css/",
    srcJs: source_folder + "/assets/js/",
  },
  src: {
    unusedHtml: source_folder + "/**/*.html",
    htmlFiles: source_folder + "/",
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: [source_folder + "/assets/sass/common.sass", source_folder + "/assets/sass/components.sass", source_folder + "/assets/sass/blocks.sass"],
    cssLibs: source_folder + "/assets/libs/css/",
    cssLibsFiles: source_folder + "/assets/libs/css/*.css",
    cssvariables: source_folder + "/assets/sass/all/_variables.sass",
    sass: source_folder + "/assets/sass/",
    sassComponents: source_folder + "/assets/sass/components/",
    js: source_folder + "/assets/js/*.js",
    jsComponents: source_folder + "/assets/js/components/",
    mainJs: source_folder + "/assets/js/script.js",
    jsLibs: source_folder + "/assets/libs/js/",
    jsLibsFiles: source_folder + "/assets/libs/js/*.js",
    img: [source_folder + "/assets/img/**/*.{jpg,jpeg,png,svg,gif,json,ico,webp,mp4,mp3,m4a,pdf}", "!" + source_folder + "/assets/img/resize/**/*.*"],
    fonts: source_folder + "/assets/fonts/",
    fontcss: source_folder + "/assets/css/fonts.css",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/assets/sass/**/*",
    cssLibs: source_folder + "/assets/libs/css/*.css",
    js: source_folder + "/assets/js/**/*.js",
    jsLibs: source_folder + "/assets/libs/js/*.js",
    img: source_folder + "/assets/img/**/*.{jpg,jpeg,png,svg,gif,json,ico,webp,mp4,mp3,m4a,pdf}",
    fonts: source_folder + "/assets/fonts/*.{woff,woff2,ttf,otf}",
    fontcss: source_folder + "/assets/css/fonts.css",
    icons: source_folder + "/assets/icons/*.svg",
  },
  clean: "./" + project_folder + "/",
};

import dotenv from "dotenv";
dotenv.config({
  path: ".env",
  quiet: true,
});

export const isBuild = process.argv.includes("--build");
export const isDev = !isBuild;
export const NODE_ENV = isBuild ? "build" : "dev";

if (project_folder == "template") {
  replaceScripts = false;
}

if (isWp) {
  paths.build = {
    html: null,
    css: "wp/wp-content/themes/main/assets/css/",
    js: "wp/wp-content/themes/main/assets/js/",
    img: "wp/wp-content/themes/main/assets/img/",
    fonts: "wp/wp-content/themes/main/assets/fonts/",
    svgSprite: "wp/wp-content/themes/main/assets/img/",
    srcHtml: source_folder + "/assets/",
    srcCss: source_folder + "/assets/css/",
    srcJs: source_folder + "/assets/js/",
  };
}
