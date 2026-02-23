import { body, bodyOpenModalClass } from "../scripts/variables";
import { hideScrollbar, showScrollbar } from "../scripts/ui/scrollbar";
import { fadeIn, fadeOut } from "../scripts/ui/animation";
import { getHash } from "../scripts/ui/url";
import { clearInputs } from "../scripts/forms/validation";

/* 
  ================================================
	  
  Модалки
	
  ================================================
*/

let modalStack = [];

// Открытие модалки
export function openModal(modal, addHashFlag = true, dataTab = null, stack = false) {
  if (!modal) return;

  if (!stack) {
    // Если не стековая, то закрыть все остальные модалки
    document.querySelectorAll(".modal_open").forEach((m) => closeModal(m, false));
    modalStack = [];
    body.classList.add(bodyOpenModalClass);
  }

  // Добавление в стек
  modalStack.push(modal);

  hideScrollbar();

  if (addHashFlag && !window.location.hash.includes(modal.id)) {
    window.location.hash = modal.id;
  }

  fadeIn(modal);

  modal.classList.remove("modal_close");
  modal.classList.add("modal_open");

  if (dataTab) {
    document.querySelector(`[data-href="#${dataTab}"]`)?.click();
  }
}

export function closeModal(modal, removeHashFlag = true) {
  if (!modal) return;

  modal.classList.remove("modal_open");
  modal.classList.add("modal_close");

  // Убираем из стека
  modalStack = modalStack.filter((m) => m !== modal);

  setTimeout(() => {
    fadeOut(modal);

    if (removeHashFlag && getHash() == modal.id) {
      if (modalStack.length) {
        window.location.hash = modalStack[modalStack.length - 1].id;
      } else {
        history.pushState("", document.title, window.location.pathname + window.location.search);
        body.classList.remove(bodyOpenModalClass);
        showScrollbar();
      }
    }

    clearInputs();

    setTimeout(() => {
      const modalInfo = document.querySelector(".modal-info");
      if (modalInfo) modalInfo.value = "";
    }, 400);
  }, 200);
}

export function modal() {
  const modalDialogs = document.querySelectorAll(".modal__dialog");

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", function () {
      let [dataModal, dataTab] = button.getAttribute("data-modal").split("#");
      const stack = button.hasAttribute("data-modal-stack");

      let modal = document.getElementById(dataModal);
      if (!modal) return;

      openModal(modal, !button.hasAttribute("data-modal-not-hash"), dataTab, stack);
    });
  });

  // Открытие модалки по хешу
  window.addEventListener("load", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const modal = document.querySelector(`.modal[id="${hash}"]`);
      if (modal) {
        setTimeout(() => {
          hideScrollbar();
          modal.classList.add("modal_open");
          fadeIn(modal);
        }, 500);
      }
    }
  });

  // Закрытие модалки при клике на крестик
  document.querySelectorAll("[data-modal-close]").forEach((element) => {
    element.addEventListener("click", () => closeModal(element.closest(".modal")));
  });

  // Закрытие модалки при клике вне области контента
  window.addEventListener("click", (e) => {
    modalDialogs.forEach((modal) => {
      if (e.target === modal) {
        closeModal(modal.closest(".modal"));
      }
    });
  });

  // Закрытие модалки при клике ESC
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.querySelectorAll(".lg-show").length === 0) {
      if (modalStack.length) {
        closeModal(modalStack[modalStack.length - 1]);
      }
    }
  });

  // Навигация назад/вперёд
  let isAnimating = false;

  window.addEventListener("popstate", async () => {
    if (isAnimating) {
      await new Promise((resolve) => {
        const checkAnimation = () => {
          if (!document.body.classList.contains("_fade")) {
            resolve();
          } else {
            setTimeout(checkAnimation, 50);
          }
        };
        checkAnimation();
      });
    }

    const hash = window.location.hash.replace("#", "");
    const modal = hash ? document.querySelector(`.modal[id="${hash}"]`) : null;
    const openedModal = document.querySelector(".modal_open");

    if (hash && modal) {
      hideScrollbar();
      isAnimating = true;
      await fadeIn(modal);

      modal.classList.remove("modal_close");
      modal.classList.add("modal_open");

      isAnimating = false;
    } else if (!hash && openedModal) {
      isAnimating = true;
      await closeModal(openedModal, false);
      isAnimating = false;
    }
  });
}
