import { isHidden } from "../core/checks";

//
//
//
//
// Анимации

const fadeTokens = new WeakMap();

// Плавное появление
export const fadeIn = (el, display = "block", timeout = 400) => {
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
export const fadeOut = (el, timeout = 400) => {
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

// Плавно скрыть с анимацией слайда
export const slideUp = (target, duration = 400, showmore = 0) => {
  if (target && !target.classList.contains("_slide")) {
    target.classList.add("_slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingBlock = 0;
    target.style.marginBlock = 0;
    window.setTimeout(() => {
      target.style.display = !showmore ? "none" : "block";
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("_slide");
      document.dispatchEvent(
        new CustomEvent("slideUpDone", {
          detail: {
            target: target,
          },
        })
      );
    }, duration);
  }
};

// Плавно показать с анимацией слайда
export const slideDown = (target, duration = 400) => {
  if (target && !target.classList.contains("_slide")) {
    target.style.removeProperty("display");
    let display = window.getComputedStyle(target).display;
    if (display === "none") display = "block";
    target.style.display = display;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = 0;
    target.style.paddingBLock = 0;
    target.style.marginBlock = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
    }, duration);
  }
};

// Плавно изменить состояние между slideUp и slideDown
export const slideToggle = (target, duration = 400) => {
  if (target && isHidden(target)) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
