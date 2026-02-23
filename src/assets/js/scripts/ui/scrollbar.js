import { html, body, bodyOpenModalClass, modals, menu, menuActive, fixedElements } from "../variables";
import { haveScroll } from "../core/checks";
import { isSafari } from "./browser";

//
//
//
//
// Функции для работы со скроллом и скроллбаром

// Скрытие скроллбара
export function hideScrollbar() {
  modals.forEach((element) => {
    element.style.display = "none";
  });

  if (haveScroll()) {
    body.classList.add("no-scroll");
  }

  // changeScrollbarPadding();
}

// Показ скроллбара
export function showScrollbar() {
  if (!menu.classList.contains(menuActive)) {
    body.classList.remove("no-scroll");
  }

  // changeScrollbarPadding(false);
}

// Ширина скроллбара
// export function getScrollBarWidth() {
//   let div = document.createElement("div");
//   div.style.overflowY = "scroll";
//   div.style.width = "50px";
//   div.style.height = "50px";
//   document.body.append(div);
//   let scrollWidth = div.offsetWidth - div.clientWidth;
//   div.remove();

//   if (haveScroll()) {
//     return scrollWidth;
//   } else {
//     return 0;
//   }
// }

// Добавление полосы прокрутки
export function changeScrollbarGutter(add = true) {
  //   if (haveScroll()) {
  //     if (add) {
  //       body.classList.add(bodyOpenModalClass, "scrollbar-auto");
  //       html.classList.add("scrollbar-auto");
  //     } else {
  //       body.classList.remove(bodyOpenModalClass, "scrollbar-auto");
  //       html.classList.remove("scrollbar-auto");
  //     }
  //   }
}

// Добавление и удаление отступа у body и фиксированных элементов
export function changeScrollbarPadding(add = true) {
  //   const scrollbarPadding = getScrollBarWidth() + "px";
  //   fixedElements.forEach((elem) => {
  //     const position = window.getComputedStyle(elem).position;
  //     if (position === "sticky") {
  //       if (add) {
  //         if (!stickyObservers.has(elem)) {
  //           const observer = new IntersectionObserver(
  //             ([entry]) => {
  //               if (!entry.isIntersecting) {
  //                 elem.style.paddingRight = scrollbarPadding;
  //               } else {
  //                 elem.style.paddingRight = "0";
  //               }
  //             },
  //             {
  //               threshold: [1],
  //             }
  //           );
  //           observer.observe(elem);
  //           stickyObservers.set(elem, observer);
  //         }
  //       } else {
  //         elem.style.paddingRight = "0";
  //         const observer = stickyObservers.get(elem);
  //         if (observer) {
  //           observer.unobserve(elem);
  //           stickyObservers.delete(elem);
  //         }
  //       }
  //     } else {
  //       elem.style.paddingRight = add ? scrollbarPadding : "0";
  //     }
  //   });
  //   if (isSafari) {
  //     body.style.paddingRight = add ? scrollbarPadding : "0";
  // }
}
