import { windowWidth, burgerMedia } from "../variables";

//
//
//
//
// Проверки

// Проверка на мобильное устройство
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent);
}

// Проверка на десктоп разрешение
export function isDesktop() {
  return windowWidth > burgerMedia;
}

// Проверка поддержки webp
export function checkWebp() {
  const webP = new Image();
  webP.onload = webP.onerror = function () {
    if (webP.height !== 2) {
      document.querySelectorAll("[style]").forEach((item) => {
        const styleAttr = item.getAttribute("style");
        if (styleAttr.indexOf("background-image") === 0) {
          item.setAttribute("style", styleAttr.replace(".webp", ".jpg"));
        }
      });
    }
  };
  webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
}

// Проверка на браузер safari
export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
