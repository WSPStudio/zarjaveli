(function () {
  'use strict';

  //
  //
  //
  //
  // Переменные
  const body = document.querySelector("body");
  const html = document.querySelector("html");
  const modals = document.querySelectorAll(".modal");

  const headerTop = document.querySelector(".header") ? document.querySelector(".header") : document.querySelector("head");
  document.querySelectorAll("[data-fixed]");

  const allForms = document.querySelectorAll("form");

  const menuClass = ".header__mobile";
  const menu = document.querySelector(menuClass) ? document.querySelector(menuClass) : document.querySelector("head");
  const menuLink = document.querySelector(".menu-link") ? document.querySelector(".menu-link") : document.querySelector("head");
  const menuActive = "active";

  const burgerMedia = 1199;
  const bodyOpenModalClass = "modal-show";

  let windowWidth = window.innerWidth;
  document.querySelector(".container").offsetWidth || 0;

  const checkWindowWidth = () => {
    windowWidth = window.innerWidth;
    document.querySelector(".container").offsetWidth || 0;
  };

  // Задержка при вызове функции. Выполняется в конце
  function debounce(fn, delay) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, arguments), delay);
    };
  }

  window.addEventListener("resize", debounce(checkWindowWidth, 100));

  // Закрытие элемента при клике вне него
  function closeOutClick(closedElement, clickedButton, clickedButtonActiveClass, callback) {
    document.addEventListener("click", (e) => {
      const button = document.querySelector(clickedButton);
      const element = document.querySelector(closedElement);
      const withinBoundaries = e.composedPath().includes(element);

      if (!withinBoundaries && button?.classList.contains(clickedButtonActiveClass) && e.target !== button && !e.target.closest(".modal")) {
        button.click();
      }
    });
  }

  //
  //
  //
  //
  // Позиционирование

  // Отступ элемента от краев страницы
  function offset(el) {
    var rect = el.getBoundingClientRect(),
      scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
      scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      right: windowWidth - rect.width - (rect.left + scrollLeft),
    };
  }

  //
  //
  //
  // Общее

  // Добавление элементу обертки
  let wrap = (query, tag, wrapContent = false) => {
    let elements;

    let tagName = tag.split(".")[0] || "div";
    let tagClass = tag.split(".").slice(1);
    tagClass = tagClass.length > 0 ? tagClass : [];

    {
      elements = document.querySelectorAll(query);
    }

    function createWrapElement(item) {
      let newElement = document.createElement(tagName);
      if (tagClass.length) {
        newElement.classList.add(...tagClass);
      }

      if (wrapContent) {
        while (item.firstChild) {
          newElement.appendChild(item.firstChild);
        }
        item.appendChild(newElement);
      } else {
        item.parentElement.insertBefore(newElement, item);
        newElement.appendChild(item);
      }
    }

    if (elements.length) {
      for (let i = 0; i < elements.length; i++) {
        createWrapElement(elements[i]);
      }
    } else {
      if (elements.parentElement) {
        createWrapElement(elements);
      }
    }
  };

  wrap("table", ".table");

  //
  //
  //
  //
  // Проверки

  // Проверка на мобильное устройство
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent);
  }

  // Проверка на десктоп разрешение
  function isDesktop() {
    return windowWidth > burgerMedia;
  }

  // Проверка поддержки webp
  function checkWebp() {
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
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  // Проверка есть ли скролл
  function haveScroll() {
    return document.documentElement.scrollHeight !== document.documentElement.clientHeight;
  }

  // Закрытие бургера на десктопе
  function checkBurgerAndMenu() {
    if (isDesktop()) {
      menuLink.classList.remove("active");
      if (menu) {
        menu.classList.remove(menuActive);
        if (!body.classList.contains(bodyOpenModalClass)) {
          body.classList.remove("no-scroll");
        }
      }
    }

    // if (html.classList.contains("lg-on")) {
    //   if (isMobile()) {
    //     body.style.paddingRight = "0";
    //   } else {
    //     body.style.paddingRight = getScrollBarWidth() + "px";
    //   }
    // }
  }

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
  function loaded() {
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

  // Проверка на браузер safari
  if (isSafari) document.documentElement.classList.add("safari");

  // Проверка поддержки webp
  checkWebp();

  // Закрытие бургера на десктопе
  window.addEventListener("resize", debounce(checkBurgerAndMenu, 100));
  checkBurgerAndMenu();

  // Добавление класса loaded при загрузке страницы
  loaded();

  // Расчет высоты шапки
  function setHeaderFixedHeight() {
    if (!headerTop) return;

    requestAnimationFrame(() => {
      const height = headerTop.offsetHeight;

      document.documentElement.style.setProperty("--headerFixedHeight", height + "px");
    });
  }

  document.addEventListener("DOMContentLoaded", setHeaderFixedHeight);

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      setHeaderFixedHeight();
    });
    ro.observe(headerTop);
  }

  //
  //
  //
  //
  // Функции для работы со скроллом и скроллбаром

  // Скрытие скроллбара
  function hideScrollbar() {
    modals.forEach((element) => {
      element.style.display = "none";
    });

    if (haveScroll()) {
      body.classList.add("no-scroll");
    }

    // changeScrollbarPadding();
  }

  // Показ скроллбара
  function showScrollbar() {
    if (!menu.classList.contains(menuActive)) {
      body.classList.remove("no-scroll");
    }

    // changeScrollbarPadding(false);
  }

  /* 
  ================================================

  Бургер

  ================================================
  */

  function burger() {
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
        if (isMobile()) ; else {
          if (body.classList.contains(bodyOpenModalClass)) ;
        }

        if (isDesktop()) {
          menu.removeAttribute("style");

          if (!body.classList.contains(bodyOpenModalClass)) {
            body.classList.remove("no-scroll");
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

  //
  //
  //
  //
  // Анимации

  const fadeTokens = new WeakMap();

  // Плавное появление
  const fadeIn = (el, display = "block", timeout = 400) => {
    document.body.classList.add("_fade");

    const elements = el instanceof Element ? [el] : document.querySelectorAll(el);

    if (!elements.length) return;

    elements.forEach((element) => {
      const token = Symbol();
      fadeTokens.set(element, token);

      element.style.transition = "none";
      element.style.opacity = 0;
      element.style.display = display;
      element.style.transition = `opacity ${timeout}ms`;

      setTimeout(() => {
        if (fadeTokens.get(element) !== token) return;
        element.style.opacity = 1;

        setTimeout(() => {
          if (fadeTokens.get(element) !== token) return;
          document.body.classList.remove("_fade");
        }, timeout);
      }, 10);
    });
  };

  // Плавное исчезновение
  const fadeOut = (el, timeout = 400) => {
    document.body.classList.add("_fade");

    const elements = el instanceof Element ? [el] : document.querySelectorAll(el);

    if (!elements.length) return;

    elements.forEach((element) => {
      const token = Symbol();
      fadeTokens.set(element, token);

      element.style.transition = "none";
      element.style.opacity = 1;
      element.style.transition = `opacity ${timeout}ms`;

      setTimeout(() => {
        if (fadeTokens.get(element) !== token) return;
        element.style.opacity = 0;

        setTimeout(() => {
          if (fadeTokens.get(element) !== token) return;
          element.style.display = "none";
          document.body.classList.remove("_fade");
        }, timeout);

        setTimeout(() => {
          if (fadeTokens.get(element) !== token) return;
          element.removeAttribute("style");
        }, timeout + 400);
      }, 10);
    });
  };

  //
  //
  //
  //
  // Работа с url

  // Получение хэша
  function getHash() {
  	return location.hash ? location.hash.replace('#', '') : '';
  }

  // Удаление хэша
  function removeHash() {
  	setTimeout(() => {
  		history.pushState("", document.title, window.location.pathname + window.location.search);
  	}, 100);
  }

  //
  //
  //
  //
  // Валидация элементов формы

  function validation() {
    let inputs = document.querySelectorAll("input, textarea");

    inputs.forEach((input) => {
      if (!input) return;

      const parentElement = input.parentElement;

      const updateActiveState = () => {
        if (input.type === "text" || input.type === "date") {
          parentElement.classList.toggle("active", input.value.length > 0);
        }
      };

      // Валидация ФИО
      const validateFIOField = () => {
        const nameAttr = input.name.toLowerCase() || "";
        const placeholder = input.placeholder.toLowerCase() || "";
        const fioKeywords = ["имя", "фамилия", "отчество"];
        const isFIO = nameAttr.includes("name") || fioKeywords.some((word) => placeholder.includes(word));

        if (isFIO) {
          input.value = input.value.replace(/[^а-яА-ЯёЁ\s]/g, "");
          input.value = input.value.replace(/\s{2,}/g, " ");
        }
      };

      input.addEventListener("keyup", updateActiveState);

      input.addEventListener("change", () => {
        input.classList.remove("wpcf7-not-valid");
        updateActiveState();

        if (input.type === "email") {
          const value = input.value.trim();

          if (!value) {
            input.setCustomValidity("");
            return;
          }

          const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

          if (!emailPattern.test(value)) {
            input.setCustomValidity("Введите корректный email");
          } else {
            input.setCustomValidity("");
          }
        }
      });

      input.addEventListener("input", () => {
        if (input.getAttribute("data-number")) {
          input.value = input.value.replace(/\D/g, "").replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
        }

        if (input.type === "email") {
          input.value = input.value.replace(/[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~@-]/g, "");
        }

        validateFIOField();
      });

      input.addEventListener("paste", (e) => {
        setTimeout(() => {
          if (input.type === "email") {
            input.value = input.value.replace(/[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~@-]/g, "");
          }
          validateFIOField();
          updateActiveState();
        }, 0);
      });
    });
  }

  validation();

  function clearInputs() {
    inputs.forEach((element) => {
      element.classList.remove("wpcf7-not-valid", "error");
    });
  }

  // Проверка формы перед отправкой
  function initFormValidation(form) {
    const getHasChoiceValue = () => {
      const requiredChoice = form.querySelectorAll("[data-required-choice]");

      return Array.from(requiredChoice).some((input) => {
        if (input.type === "tel") {
          return input.value.replace(/\D/g, "").length >= 11;
        }

        return input.value.trim() !== "";
      });
    };

    const updateRequiredChoice = () => {
      const hasChoiceValue = getHasChoiceValue();
      const requiredChoice = form.querySelectorAll("[data-required-choice]");

      requiredChoice.forEach((input) => {
        if (hasChoiceValue) {
          input.removeAttribute("required");
          input.setCustomValidity("");
        } else {
          input.setAttribute("required", "true");
        }
      });
    };

    updateRequiredChoice();

    form.addEventListener(
      "submit",
      (e) => {
        let isValid = true;

        updateRequiredChoice();

        const hasChoiceValue = getHasChoiceValue();
        const inputTel = form.querySelector('input[type="tel"]');

        if (inputTel) {
          const digits = inputTel.value.replace(/\D/g, "");

          if (!hasChoiceValue && digits.length > 0 && digits.length !== 11) {
            e.preventDefault();
            isValid = false;
          } else {
            inputTel.setCustomValidity("");
          }
        }

        if (!isValid || !form.checkValidity()) {
          e.preventDefault();
        }
      },
      {
        capture: true,
      }
    );

    const requiredChoice = form.querySelectorAll("[data-required-choice]");

    requiredChoice.forEach((input) => {
      input.addEventListener("input", updateRequiredChoice);
    });
  }

  if (allForms) {
    allForms.forEach((form) => {
      initFormValidation(form);
    });
  }

  // После отправки формы
  function successSubmitForm(form) {
    fadeOut(".modal");

    setTimeout(() => {
      fadeIn(".modal-thank");
    }, modalInterval - 500);

    setTimeout(() => {
      fadeOut(".modal");
    }, modalInterval * 2);

    setTimeout(() => {
      body.classList.remove("no-scroll");
    }, modalInterval * 3);

    // form.reset();

    // const originalPlaceholders = form.querySelectorAll("[data-original-placeholder]");

    // if (originalPlaceholders) {
    //   originalPlaceholders.forEach((input) => {
    //     input.placeholder = input.getAttribute("data-original-placeholder");
    //   });
    // }
  }

  if (typeof window !== "undefined") {
    window.successSubmitForm = successSubmitForm;
  }

  // Валидация поля Телефон или Почта
  const inputs = document.querySelectorAll("[data-tel-or-email]");

  inputs.forEach((input) => {
    let mode = "";
    const originalPlaceholder = input.placeholder;

    input.addEventListener("input", (e) => {
      input.setCustomValidity("");

      let val = input.value;

      if (val.includes("+")) {
        const firstPlus = val.indexOf("+");
        val = (firstPlus === 0 ? "+" : "") + val.replace(/\+/g, "").trim();
        input.value = val;
      }

      const trimmed = val.trim();
      const hasAt = trimmed.includes("@");
      const hasLetter = /[a-zA-Zа-яА-Я]/.test(trimmed);
      const digitsOnly = trimmed.replace(/\D/g, "");
      const startsLikePhone = /^[\+78]/.test(trimmed);
      const isPhone = digitsOnly.length >= 4 && !hasLetter && !hasAt && val !== "+";

      if ((startsLikePhone || isPhone) && !hasLetter && !hasAt) {
        if (mode !== "phone") {
          mode = "phone";
          input.type = "tel";
          input.placeholder = "";
        }
        maskPhone();
      } else {
        if (mode !== "email") {
          mode = "email";
          input.type = "email";
          input.placeholder = originalPlaceholder;
        }
        validation();
      }
    });
  });

  /* 
    ================================================
  	  
    Модалки
  	
    ================================================
  */

  let modalStack = [];

  // Открытие модалки
  function openModal(modal, addHashFlag = true, dataTab = null, stack = false) {
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

  function closeModal(modal, removeHashFlag = true) {
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

  function modal() {
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

  /* 
    ================================================
  	  
    Галерея
  	
    ================================================
  */

  function viewer() {
    const galleries = document.querySelectorAll("[data-viewer]");
    if (!galleries.length) return;

    const galleryData = [];

    galleries.forEach((gallery, index) => {
      if (gallery.classList.contains("viewer_init")) return;

      const items = [];
      const galleryItems = gallery.querySelectorAll("a[href], [data-viewer-item]");

      galleryItems.forEach((el) => {
        const src = el.getAttribute("href") || el.getAttribute("data-src");
        if (!src) return;

        const title = el.getAttribute("data-title") || el.querySelector("img")?.alt || undefined;
        const description = el.getAttribute("data-description") || undefined;
        const button = el.getAttribute("data-button") || undefined;
        const buttonHref = el.getAttribute("data-button-href") || undefined;
        const fit = el.getAttribute("data-fit") || undefined;

        items.push({
          src,
          title: title === "false" ? false : title,
          description,
          button,
          onclick: buttonHref
            ? () => {
                const target = galleryData.find((g) => g.id === buttonHref.trim());
                if (target) {
                  openSpotlight(target.items, 1);
                }
              }
            : undefined,
          fit,
        });
      });

      if (items.length === 0) return;

      const id = gallery.getAttribute("data-viewer");

      galleryData.push({
        items,
        gallery,
        index: index,
        id: id && id.trim() !== "" ? id.trim() : null,
      });

      gallery.addEventListener("click", (e) => {
        const link = e.target.closest("a[href], [data-viewer-item]");
        if (!link) return;

        e.preventDefault();
        e.stopPropagation();

        const idx = Array.from(galleryItems).indexOf(link);
        if (idx === -1) return;

        openSpotlight(items, idx + 1);
      });

      gallery.classList.add("viewer_init");
    });

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-viewer-open]");
      if (!btn) return;

      const value = btn.getAttribute("data-viewer-open")?.trim();
      if (!value) return;

      let targetItems = null;

      const n = parseInt(value, 10);
      if (!isNaN(n) && n >= 1) {
        const targetIndex = n - 1;
        if (targetIndex < galleryData.length) {
          targetItems = galleryData[targetIndex].items;
        }
      } else {
        const target = galleryData.find((g) => g.id === value);
        if (target) {
          targetItems = target.items;
        }
      }

      if (targetItems) {
        openSpotlight(targetItems, 1);
      }
    });
  }

  function openSpotlight(items, startIndex = 1) {
    if (!items?.length) return;

    Spotlight.show(items, {
      index: startIndex,
      animation: "slide,fade,scale",
      control: "page,zoom,autofit,fullscreen,download,play,close",
      zoom: true,
      autofit: true,
      fullscreen: true,
      download: true,
      play: false,
      // autoslide: 4 ,
      progress: true,
      close: true,
      page: true,
    });

    let closing = false;

    const handler = (e) => {
      if (closing) return;
      const pane = e.target.closest(".spl-pane");
      const img = e.target.closest("img");
      if (!pane || img) return;

      closing = true;
      Spotlight.close();
      document.removeEventListener("pointerdown", handler, true);
    };

    document.addEventListener("pointerdown", handler, true);
  }

  /* 
  	================================================
  	  
  	Карты
  	
  	================================================
  */

  function map() {
    let spinner = document.querySelectorAll(".loader");
    let check_if_load = false;

    function loadScript(url, callback) {
      let script = document.createElement("script");
      if (script.readyState) {
        script.onreadystatechange = function () {
          if (script.readyState == "loaded" || script.readyState == "complete") {
            script.onreadystatechange = null;
            callback();
          }
        };
      } else {
        script.onload = function () {
          callback();
        };
      }

      script.src = url;
      document.getElementsByTagName("head")[0].appendChild(script);
    }

    function initMap() {
      loadScript("https://api-maps.yandex.ru/2.1/?apikey=5b7736c7-611f-40ce-a5a8-b7fd86e6737c&lang=ru_RU&amp;loadByRequire=1", function () {
        ymaps.load(init);
      });
      check_if_load = true;
    }

    if (document.querySelectorAll(".map").length) {
      let observer = new IntersectionObserver(
        function (entries) {
          if (entries[0]["isIntersecting"] === true) {
            if (!check_if_load) {
              spinner.forEach((element) => {
                element.classList.add("is-active");
              });
              if (entries[0]["intersectionRatio"] > 0.1) {
                initMap();
              }
            }
          }
        },
        {
          threshold: [0, 0.1, 0.2, 0.5, 1],
          rootMargin: "200px 0px",
        }
      );

      observer.observe(document.querySelector(".map"));
    }
  }

  function waitForTilesLoad(layer) {
    return new ymaps.vow.Promise(function (resolve, reject) {
      let tc = getTileContainer(layer),
        readyAll = true;
      tc.tiles.each(function (tile, number) {
        if (!tile.isReady()) {
          readyAll = false;
        }
      });
      if (readyAll) {
        resolve();
      } else {
        tc.events.once("ready", function () {
          resolve();
        });
      }
    });
  }

  function getTileContainer(layer) {
    for (let k in layer) {
      if (layer.hasOwnProperty(k)) {
        if (layer[k] instanceof ymaps.layer.tileContainer.CanvasContainer || layer[k] instanceof ymaps.layer.tileContainer.DomContainer) {
          return layer[k];
        }
      }
    }
    return null;
  }

  window.waitForTilesLoad = waitForTilesLoad;
  window.getTileContainer = getTileContainer;

  // Плавный скролл
  function scrollToSmoothly(pos, time = 400) {
    const currentPos = window.pageYOffset;
    let start = null;
    window.requestAnimationFrame(function step(currentTime) {
      start = !start ? currentTime : start;
      const progress = currentTime - start;
      if (currentPos < pos) {
        window.scrollTo(0, ((pos - currentPos) * progress) / time + currentPos);
      } else {
        window.scrollTo(0, currentPos - ((currentPos - pos) * progress) / time);
      }
      if (progress < time) {
        window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, pos);
      }
    });
  }

  // Изменение масштаба
  class ZoomDetector {
    constructor() {
      this.lastZoom = this.getCurrentZoom();
      this.isChecking = false;
      this.startDetection();
    }

    getCurrentZoom() {
      return window.outerWidth / window.innerWidth;
    }

    startDetection() {
      const checkZoom = () => {
        const currentZoom = this.getCurrentZoom();

        if (Math.abs(currentZoom - this.lastZoom) > 0.01) {
          this.lastZoom = currentZoom;
          this.onZoomChange(currentZoom);
        }

        if (this.isChecking) {
          requestAnimationFrame(checkZoom);
        }
      };

      this.isChecking = true;
      checkZoom();
    }

    stopDetection() {
      this.isChecking = false;
    }

    onZoomChange(zoomLevel) {
      const percentage = Math.round(zoomLevel * 100);
      // Отправка события
      window.dispatchEvent(
        new CustomEvent("zoomchange", {
          detail: { zoomLevel: percentage },
        })
      );
    }
  }

  new ZoomDetector();

  window.addEventListener("zoomchange", (e) => {
    if (haveScroll() && body.classList.contains(bodyOpenModalClass)) ;
  });

  /* 
  	================================================
  	  
  	Плавная прокрутка
  	
  	================================================
  */

  function scroll() {
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

  /* 
  	================================================
  	  
  	Вставка видео
  	
  	================================================
  */

  function video() {
    document.addEventListener("DOMContentLoaded", () => {
      class LazyVideo {
        constructor(videoUrl, options = {}) {
          const defaults = {
            isFile: false,
            autoplay: false,
            controls: true,
            loop: true,
          };

          const settings = Object.assign(defaults, options);

          this.isFile = settings.isFile;
          this.container = settings.container;
          this.autoplay = settings.autoplay;
          this.controls = settings.controls;
          this.loop = settings.loop;
          this.videoUrl = this.normalizeUrl(videoUrl);

          if (!this.container) {
            console.error("Ошибка: не найден блок .video");
            return;
          }

          this.thumbnail = this.container.querySelector(".video__thumbnail");
          this.playButton = this.container.querySelector(".video__play");

          this.check();
          this.init();
        }

        check() {
          if (!this.videoUrl) {
            console.error("Ошибка: не указан адрес видео");
            return;
          }
        }

        init() {
          if (this.autoplay) {
            this.loadVideo();
            return;
          }

          if (this.playButton) {
            this.playButton.addEventListener("click", () => this.loadVideo());
          }
        }

        loadVideo() {
          if (this.thumbnail) this.thumbnail.remove();
          if (this.playButton) this.playButton.remove();

          if (this.isFile) {
            const video = document.createElement("video");

            video.src = this.videoUrl;

            if (this.controls) {
              video.controls = true;
            }

            if (this.loop) {
              video.loop = true;
            }

            if (this.autoplay) {
              video.autoplay = true;
              video.muted = true;
              video.playsInline = true;
            }

            this.container.appendChild(video);

            if (this.autoplay) {
              video.play().catch(() => {});
            }
          } else {
            let url = this.videoUrl;

            if (this.autoplay) {
              url += `${url.includes("?") ? "&" : "?"}autoplay=1`;
            }

            const iframe = document.createElement("iframe");
            iframe.src = url;
            iframe.allow = "autoplay; encrypted-media";
            iframe.allowFullscreen = true;

            this.container.appendChild(iframe);
          }
        }

        normalizeUrl(url) {
          const vkShortRegex = /^https:\/\/vkvideo\.ru\/video(\d+)_(\d+)$/;
          const vkMatch = url.match(vkShortRegex);

          if (vkMatch) {
            const oid = vkMatch[1];
            const id = vkMatch[2];
            return `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${id}&hd=2`;
          }

          const rutubeRegex = /^https:\/\/rutube\.ru\/video\/([a-z0-9]+)\/?$/i;
          const rutubeMatch = url.match(rutubeRegex);

          if (rutubeMatch) {
            const id = rutubeMatch[1];
            return `https://rutube.ru/play/embed/${id}`;
          }

          return url;
        }
      }

      const videos = document.querySelectorAll(".video");

      if (!videos.length) return;

      videos.forEach((video) => {
        const videoUrl = video.dataset.url;

        if (!videoUrl) return;

        const isFile = (() => {
          try {
            const url = new URL(videoUrl, window.location.origin);
            return url.origin === window.location.origin;
          } catch {
            return true;
          }
        })();

        const autoplay = video.hasAttribute("autoplay");

        let controls = true;
        let loop = true;

        if (video.hasAttribute("controls")) {
          const value = video.getAttribute("controls");
          if (value === "false") {
            controls = false;
          }
        }

        if (video.hasAttribute("loop")) {
          const value = video.getAttribute("loop");
          if (value === "false") {
            loop = false;
          }
        }

        new LazyVideo(videoUrl, {
          container: video,
          isFile: isFile,
          autoplay: autoplay,
          controls: controls,
          loop: loop,
        });
      });
    });
  }

  burger();
  modal();
  viewer();
  map();
  scroll();
  video();

  //
  //
  //
  //
  // Общие скрипты

  // Слайдер главный
  if (document.querySelector(".header-main-container")) {
    new Swiper(".header-main-container", {
      // autoplay: {
      //   delay: 4000,
      //   pauseOnMouseEnter: true,
      // },
      loop: true,
      resistanceRatio: 0,
      pagination: {
        el: ".header-main__pagination",
        type: "bullets",
        clickable: true,
      },
      navigation: {
        nextEl: ".header-main__next",
        prevEl: ".header-main__prev",
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
      speed: 500,
    });
  }

  // Слайдер залов
  const roomItems = document.querySelectorAll(".room__item");

  if (roomItems) {
    roomItems.forEach((item) => {
      const roomSlider = item.querySelector(".room-container");

      if (roomSlider) {
        new Swiper(roomSlider, {
          // autoplay: {
          //   delay: 4000,
          //   pauseOnMouseEnter: true,
          // },
          loop: true,
          resistanceRatio: 0,
          effect: "fade",
          fadeEffect: {
            crossFade: true,
          },
          spaceBetween: 24,
          pagination: {
            el: roomSlider.parentElement.querySelector(".room__pagination"),
            type: "bullets",
            clickable: true,
          },
          speed: 500,
          breakpoints: {
            1: {
              slidesPerView: 1,
            },
            768: {
              slidesPerView: 2,
            },
            992: {
              slidesPerView: 1,
            },
          },
        });
      }
    });
  }

  // Смотреть еще в галерее
  document.addEventListener("DOMContentLoaded", function () {
    const wrapper = document.querySelector(".gallery__wrapper");
    const items = wrapper ? Array.from(wrapper.querySelectorAll(".gallery__item")) : [];
    const button = document.querySelector(".gallery__button");

    if (!wrapper || !items.length) return;

    const initiallyVisible = 10;
    const loadStep = 7;

    let visibleCount = 0;

    items.forEach((item, index) => {
      if (index >= initiallyVisible) {
        item.style.display = "none";
      } else {
        visibleCount++;
      }
    });

    if (items.length <= initiallyVisible && button) {
      button.style.display = "none";
    }

    if (!button) return;

    button.addEventListener("click", function () {
      let shownNow = 0;

      for (let i = visibleCount; i < items.length; i++) {
        if (shownNow >= loadStep) break;

        const item = items[i];
        const picture = item.querySelector("picture");
        if (!picture) continue;

        const sources = picture.querySelectorAll("source");
        const img = picture.querySelector("img");

        sources.forEach((source) => {
          if (source.dataset.srcset) {
            source.setAttribute("srcset", source.dataset.srcset);
            source.removeAttribute("data-srcset");
          }
        });

        if (img.dataset.src) {
          img.setAttribute("src", img.dataset.src);
          img.removeAttribute("data-src");
        }

        item.style.display = "";
        shownNow++;
        visibleCount++;
      }

      if (visibleCount >= items.length) {
        button.style.display = "none";
      }
    });
  });

  // Параллакс рамки
  const parallaxImages = document.querySelectorAll(".info__left, .conditions__left");

  if (parallaxImages) {
    const maxShift = 20;

    parallaxImages.forEach((item) => {
      item.addEventListener("mousemove", (e) => {
        const rect = item.getBoundingClientRect();

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const percentX = (offsetX - centerX) / centerX;
        const percentY = (offsetY - centerY) / centerY;

        const moveX = -percentX * maxShift;
        const moveY = -percentY * maxShift;

        item.style.setProperty("--moveX", `${moveX}px`);
        item.style.setProperty("--moveY", `${moveY}px`);
      });

      item.addEventListener("mouseleave", () => {
        item.style.setProperty("--moveX", "0px");
        item.style.setProperty("--moveY", "0px");
      });
    });
  }

})();
//# sourceMappingURL=script.js.map
