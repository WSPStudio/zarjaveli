import { body, menu, menuActive, menuLink, headerTop, bodyOpenModalClass } from "../scripts/variables";
import { debounce, closeOutClick } from "../scripts/core/helpers";
import { isDesktop, isMobile, isSafari } from "../scripts/ui/browser";
import { changeScrollbarPadding, hideScrollbar, showScrollbar } from "../scripts/ui/scrollbar";

/* 
================================================

Бургер

================================================
*/

export function burger() {
  if (menuLink) {
    let isAnimating = false;

    menuLink.addEventListener("click", function (e) {
      if (isAnimating) return;
      isAnimating = true;

      menuLink.classList.toggle("active");
      menu.classList.toggle(menuActive);

      if (menu.classList.contains(menuActive)) {
        hideScrollbar();

        const scrollY = window.scrollY;
        const headerHeight = headerTop.offsetHeight;

        if (scrollY === 0) {
          menu.style.removeProperty("top");
        } else if (scrollY < headerHeight) {
          menu.style.top = scrollY + "px";
        } else {
          const headerRect = headerTop.getBoundingClientRect();
          menu.style.top = headerRect.bottom + "px";
        }
      } else {
        setTimeout(() => {
          showScrollbar();
        }, 400);
      }

      setTimeout(() => {
        isAnimating = false;
      }, 500);
    });

    function checkHeaderOffset() {
      if (isMobile()) {
        // changeScrollbarPadding(false);
      } else {
        if (body.classList.contains(bodyOpenModalClass)) {
          // changeScrollbarPadding();
        }
      }

      if (isDesktop()) {
        menu.removeAttribute("style");

        if (!body.classList.contains(bodyOpenModalClass)) {
          body.classList.remove("no-scroll");

          if (isSafari) {
            // changeScrollbarPadding(false);
          }
        }
      }
    }

    window.addEventListener("resize", debounce(checkHeaderOffset, 50));
    window.addEventListener("resize", debounce(checkHeaderOffset, 150));

    if (document.querySelector(".header__mobile")) {
      closeOutClick(".header__mobile", ".menu-link", "active");
    }
  }
}
