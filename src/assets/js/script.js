import "./scripts/init.js";
import "./components.js";
import { windowWidth } from "./scripts/variables.js";

//
//
//
//
// Общие скрипты

// Слайдер главный
if (document.querySelector(".header-main-container")) {
  let headerMainSlider = new Swiper(".header-main-container", {
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
    const loadStep = windowWidth <= 575 ? 6 : 7;

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

// Куки
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const cookiesBlock = document.querySelector(".cookies");
    const cookiesButton = document.querySelector(".cookies__button");

    if (!localStorage.getItem("cookiesAccepted")) {
      cookiesBlock.classList.add("active");
    }

    cookiesButton.addEventListener("click", function () {
      cookiesBlock.classList.remove("active");
      localStorage.setItem("cookiesAccepted", "true");
    });
  }, 3000);
});

if (typeof BX !== "undefined" && typeof BX.ready === "function") {
  BX.ready(function () {
    // Привязываем календарь при клике к полю "Желаемая дата"
    var form_book = document.querySelector('form[name="SIMPLE_FORM_4"]');
    var inputNode = form_book.querySelector(".date-input");
    BX.bind(inputNode, "click", function () {
      BX.calendar({
        node: inputNode, // Поле, к которому привязан календарь
        field: inputNode, // Поле, куда запишется дата
        bTime: false, // false - только дата, true - с временем
        bHideTime: false, // Скрыть время
      });
    });

    // Передаем название зала в форму при клике в блоке "Наши залы"
    var room = BX("room");
    room.querySelectorAll('.button[data-modal="modal-book"]').forEach((buttonNode) => {
      BX.bind(buttonNode, "click", function (e) {
        var col = e.target.closest(".room__item-col");
        var title = col.querySelector(".room__item-title");
        var form = document.querySelector('form[name="SIMPLE_FORM_4"]');
        var room_name_input = form.querySelector(".room-name-input");
        room_name_input.value = title.textContent;
      });
    });
  });
}

function resetForm(form) {
  if (!form) return;

  form.reset();

  let hiddenInputs = form.querySelectorAll('[name*="form_text"]');
  if (hiddenInputs) {
    hiddenInputs.forEach((input) => {
      input.value = "";
    });
  }

  let activeTags = form.querySelectorAll(".active");
  activeTags.forEach((tag) => {
    tag.classList.remove("active");
  });
}
