import { body, menu, menuActive, menuLink, headerTop } from "../scripts/variables";
import { offset } from "../scripts/core/helpers";
import { scrollToSmoothly } from "../scripts/ui/scroll";
import { removeHash } from "../scripts/ui/url";

/* 
	================================================
	  
	Плавная прокрутка
	
	================================================
*/

export function scroll() {
  let headerScroll = 0;
  const scrollLinks = document.querySelectorAll("[data-scroll], .menu a");

  if (scrollLinks.length) {
    scrollLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = link.hash;

        if (target && target !== "#") {
          const scrollBlock = document.querySelector(target);
          e.preventDefault();

          if (scrollBlock) {
            headerScroll = window.getComputedStyle(scrollBlock).paddingTop === "0px" ? -40 : 0;

            scrollToSmoothly(offset(scrollBlock).top - parseInt(headerTop.clientHeight - headerScroll), 400);

            removeHash();
            menu.classList.remove(menuActive);
            menuLink.classList.remove("active");
            body.classList.remove("no-scroll");
          } else {
            let [baseUrl, hash] = link.href.split("#");
            if (window.location.href !== baseUrl && hash) {
              link.setAttribute("href", `${baseUrl}?link=${hash}`);
              window.location = link.getAttribute("href");
            }
          }
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const link = urlParams.get("link");

    if (link) {
      if (link.startsWith("tab-") && /^\d+-\d+$/.test(link.replace("tab-", ""))) {
        const [_, blockIndex, tabIndex] = link.split("-");
        const tabsBlock = document.querySelector(`[data-tabs-index="${blockIndex}"]`);
        const tabs = tabsBlock.querySelectorAll("[data-tabs-title]");

        if (tabs && tabs[tabIndex]) {
          tabs[tabIndex].click();

          scrollToSmoothly(offset(tabsBlock).top - parseInt(headerTop.clientHeight), 400);
        }
      } else if (link.startsWith("tab-")) {
        const tabId = link;
        const tabButton = document.getElementById(tabId);

        if (tabButton) {
          tabButton.click();

          scrollToSmoothly(offset(tabButton.closest("[data-tabs]") || tabButton).top - parseInt(headerTop.clientHeight), 400);
        }
      } else {
        const scrollBlock = document.getElementById(link);
        if (scrollBlock) {
          const headerScroll = window.getComputedStyle(scrollBlock).paddingTop === "0px" ? -40 : 0;
          scrollToSmoothly(offset(scrollBlock).top - parseInt(headerTop.clientHeight - headerScroll), 400);
        }
      }

      urlParams.delete("link");
      const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams}` : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  });
}
