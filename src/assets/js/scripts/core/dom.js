import { html } from "../variables";
import { haveScroll } from "./checks";

// Изменение ссылок в меню
if (!document.querySelector("body").classList.contains("home") && document.querySelector("body").classList.contains("wp")) {
  let menu = document.querySelectorAll(".menu li a");

  for (let i = 0; i < menu.length; i++) {
    if (menu[i].getAttribute("href").indexOf("#") > -1) {
      menu[i].setAttribute("href", "/" + menu[i].getAttribute("href"));
    }
  }
}

// Добавление класса loaded после полной загрузки страницы
export function loaded() {
  document.addEventListener("DOMContentLoaded", function () {
    html.classList.add("loaded");
    if (document.querySelector("header")) {
      document.querySelector("header").classList.add("loaded");
    }
    if (haveScroll()) {
      setTimeout(() => {
        html.classList.remove("scrollbar-auto");
      }, 500);
    }
  });
}

// Для локалки
if (window.location.hostname == "localhost" || window.location.hostname.includes("192.168")) {
  document.querySelectorAll(".logo, .crumbs>li:first-child>a").forEach((logo) => {
    logo.setAttribute("href", "/");
  });

  document.querySelectorAll(".menu a").forEach((item) => {
    let firstSlash = 0;
    let lastSlash = 0;

    if (item.href.split("/").length - 1 == 4) {
      for (let i = 0; i < item.href.length; i++) {
        if (item.href[i] == "/") {
          if (i > 6 && firstSlash == 0) {
            firstSlash = i;
            continue;
          }

          if (i > 6 && lastSlash == 0) {
            lastSlash = i;
          }
        }
      }

      let newLink = "";
      let removeProjectName = "";

      for (let i = 0; i < item.href.length; i++) {
        if (i > firstSlash && i < lastSlash + 1) {
          removeProjectName += item.href[i];
        }
      }

      newLink = item.href.replace(removeProjectName, "");
      item.href = newLink;
    }
  });
}
