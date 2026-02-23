import gulp from "gulp";
import path from "path";
import fs from "fs";
import log from "fancy-log";
import ftp from "vinyl-ftp";
import dotenv from "dotenv";

import { project_folder, template, isDeploy, paths, isWp } from "./settings.js";

dotenv.config({
  quiet: true,
});

const hosts = {
  siteup: {
    domen: ".siteup.ru/",
    ftp: {
      host: process.env.FTP_HOST_SITEUP,
      user: process.env.FTP_USER_SITEUP,
      password: process.env.FTP_PASS_SITEUP,
    },
  },
  wsp: {
    domen: "verstka.demo-wsp.ru/",
    ftp: {
      host: process.env.FTP_HOST_WSP,
      user: process.env.FTP_USER_WSP,
      password: process.env.FTP_PASS_WSP,
    },
  },
  default: {
    domen: ".osmanovremzi.ru/",
    ftp: {
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
    },
  },
};

const current = hosts[template] || hosts.default;

if (!current.ftp.host || !current.ftp.user || !current.ftp.password) {
  throw new Error("❌ Неправильные FTP доступы");
}

export const deployPaths = {
  normal: {
    base: project_folder,
    root: project_folder,
  },
  wp: {
    base: "wp/wp-content/themes/main",
    root: "wp/wp-content/themes/main",
  },
};

const currentDeploy = isWp ? deployPaths.wp : deployPaths.normal;

const createFastConn = () => {
  return ftp.create({
    host: current.ftp.host,
    user: current.ftp.user,
    password: current.ftp.password,
    parallel: 2,
    passive: true,
    // keepalive: 10000,
    log,
  });
};

const createSafeConn = () => {
  return ftp.create({
    host: current.ftp.host,
    user: current.ftp.user,
    password: current.ftp.password,
    parallel: 1,
    passive: true,
    // keepalive: 10000,
    log,
  });
};

function buildOnly() {
  if (!fs.existsSync(path.join(paths.build.css, "style.css"))) {
    log.warn("❌ Таск доступен только в build режиме. Запусти: gulp --build");
    return false;
  }
  return true;
}

export function getLink() {
  if (template === "wsp") return "/" + project_folder;
  if (isWp) return `/www/${project_folder}${current.domen}wp-content/themes/main/`;
  return `/www/${project_folder}${current.domen}`;
}

function deployRunner(globs) {
  if (!buildOnly()) return Promise.resolve();

  const conn = createFastConn();

  return gulp.src(globs, { base: currentDeploy.base, buffer: false }).pipe(conn.dest(getLink()));
}

// prettier-ignore
const deployTask = () => 
  deployRunner(isWp ? [
    `${currentDeploy.root}/assets/css/style.css`, 
    `${currentDeploy.root}/assets/js/script.js`
  ] : [
    `${project_folder}/*.html`, 
    `${project_folder}/assets/css/style.css`, 
    `${project_folder}/assets/js/script.js`
  ]
);

// prettier-ignore
const deployAllTask = () => deployRunner([
  `${currentDeploy.root}/**/*.*`
]);

// prettier-ignore
const deploySpriteTask = () => deployRunner([
  `${currentDeploy.root}/assets/img/sprite.svg`
]);

// prettier-ignore
const deployLibsTask = () => deployRunner([
  `${currentDeploy.root}/assets/css/vendor.css`, `${currentDeploy.root}/assets/js/vendor.js`
]);

// prettier-ignore
const deployImagesTask = () => deployRunner([
  `${currentDeploy.root}/assets/img/**/*`
]);

// prettier-ignore
const deployHtml = () => {
  if (isWp || !isDeploy) return Promise.resolve();

  return deployRunner([
    `${project_folder}/*.html`
  ]);
};

// prettier-ignore
const deployCss = () => {
  if (!isDeploy) return Promise.resolve();

  return deployRunner([
    `${currentDeploy.root}/assets/css/*.css`, 
    `!${currentDeploy.root}/assets/css/vendor.css`, 
    `!${currentDeploy.root}/assets/css/fonts.css`
  ]);
};

// prettier-ignore
const deployJs = () => {
  if (!isDeploy) return Promise.resolve();

  return deployRunner([
    `${currentDeploy.root}/assets/js/*.js`, 
    `!${currentDeploy.root}/assets/js/vendor.js`
  ]);
};

gulp.task("deploy", deployTask);
gulp.task("deploy-all", deployAllTask);
gulp.task("deploy-sprite", deploySpriteTask);
gulp.task("deploy-libs", deployLibsTask);
gulp.task("deploy-images", deployImagesTask);

export { deployTask, deployAllTask, deploySpriteTask, deployLibsTask, deployImagesTask, deployHtml, deployCss, deployJs };
