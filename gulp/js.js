import gulp from "gulp";
const { src, dest } = gulp;
import fs from "fs";
import browsersync from "browser-sync";
import { paths, isBuild, jsBundler, concatLibs } from "./settings.js";
import esbuild from "esbuild";
import * as rollupJs from "rollup";
import { configs } from "../rollup.config.js";
import beautify from "gulp-beautify";

export async function jsLibs() {
  const vendorPath = paths.src.jsLibs + "vendor.js";
  const outputFile = paths.build.js + (concatLibs ? "vendor.js" : "swiper.js");

  let vendorContent = fs.readFileSync(vendorPath, "utf-8");
  let tempVendorPath = vendorPath;

  if (!concatLibs) {
    const importRegex = /import\s+["']\.\/(.+?)\.js["'];/g;
    vendorContent = vendorContent.replace(importRegex, (match, p1) => {
      return p1 === "swiper" ? match : "";
    });

    tempVendorPath = paths.src.jsLibs + "_vendor_swiper.js";
    fs.writeFileSync(tempVendorPath, vendorContent);
  }

  await esbuild.build({
    entryPoints: [tempVendorPath],
    bundle: true,
    format: "iife",
    outfile: outputFile,
    sourcemap: false,
    minify: isBuild,
    target: "es2018",
    legalComments: "none",
    logLevel: "silent",
  });

  if (!concatLibs && fs.existsSync(tempVendorPath)) fs.unlinkSync(tempVendorPath);

  if (!concatLibs) {
    const importRegex = /import\s+["']\.\/(.+?)\.js["'];/g;
    const imports = [];
    let match;
    while ((match = importRegex.exec(fs.readFileSync(vendorPath, "utf-8"))) !== null) {
      const file = match[1];
      if (file !== "swiper") imports.push(file + ".js");
    }

    if (imports.length) {
      await new Promise((resolve) => {
        gulp
          .src(imports.map((f) => paths.src.jsLibs + f))
          .pipe(gulp.dest(paths.build.js))
          .pipe(browsersync.stream())
          .on("end", resolve);
      });
    }
  } else {
    browsersync.reload();
  }
}

export async function js() {
  const isDev = !process.env.BUILD;

  if (jsBundler === "esbuild") {
    await esbuild.build({
      entryPoints: [paths.src.mainJs],
      bundle: true,
      outfile: paths.build.js + "script.js",
      format: "iife",
      target: "es2020",

      sourcemap: isDev,
      minify: false,
      keepNames: true,
      treeShaking: false,

      legalComments: "none",
      logLevel: "silent",
    });

    return src(paths.build.js + "script.js")
      .pipe(
        beautify.js({
          indent_size: 2,
          indent_char: " ",
          preserve_newlines: true,
          max_preserve_newlines: 2,
          brace_style: "collapse",
          keep_array_indentation: false,
          space_in_paren: false,
        })
      )
      .pipe(dest(paths.build.js));
  } else if (jsBundler === "rollup") {
    for (const config of configs) {
      const bundle = await rollupJs.rollup(config);
      await bundle.write(config.output);

      if (config.input) {
        // trackFile(config.input);
      }
    }
  } else {
    throw new Error(`Unknown jsBundler: ${jsBundler}`);
  }
}
