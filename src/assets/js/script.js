import "./scripts/init.js";
import "./components.js";

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
