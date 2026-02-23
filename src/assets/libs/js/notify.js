/* 
	================================================
	  
	Всплывающие уведомления
	
	================================================
*/

class Notify {
  constructor(t) {
    (this._title = !1 !== t.title && (t.title || "")),
      (this._text = t.text || ""),
      (this._theme = t.theme || "success"),
      (this._autohide = t.autohide ? t.autohide : false),
      (this._interval = +t.interval || 5e3),
      this._create(),
      this._el.addEventListener("click", (t) => {
        if (t.target.classList.contains("notify__item-close")) {
          notifySlideUp(this._el, 200);
          setTimeout(() => {
            this._hide();
          }, 200);
        }
      }),
      this._show(),
      notifySlideDown(this._el, 500);
  }
  _show() {
    this._el.classList.add("notify__item-show"),
      this._autohide &&
        setTimeout(() => {
          if (this._autohide == true || this._autohide.toLowerCase() == "true") {
            notifySlideUp(this._el, 300);
            setTimeout(() => {
              this._hide();
            }, 400);
          }
        }, this._interval);
  }
  _hide() {
    this._el.classList.remove("notify__item-show");
    const t = new CustomEvent("hide.notify", {
      detail: {
        target: this._el,
      },
    });
    document.dispatchEvent(t);
    this._el.remove();
  }
  _create() {
    const t = document.createElement("div");
    t.classList.add(`notify__item_${this._theme}`);
    t.classList.add("notify__item");

    let e = `
        <div class="notify__item-content">
          <div class="notify__item-left">
            <div class="notify__item-icon">
            </div>
          </div>
          <div class="notify__item-right">
            {header}
            <div class="notify__item-text"></div>
          </div>
        </div>
        <button class="notify__item-close">
          <svg class="close-icon"><use xlink:href="assets/img/sprite.svg#close"></use></svg>
        </button>
      `;

    const s = !1 === this._title ? "" : '<div class="notify__item-title"></div>';
    if (((e = e.replace("{header}", s)), (t.innerHTML = e), this._title ? (t.querySelector(".notify__item-title").textContent = this._title) : t.classList.add("notify_message"), (t.querySelector(".notify__item-text").innerHTML = this._text), (this._el = t), !document.querySelector(".notify"))) {
      const t = document.createElement("div");
      t.classList.add("notify"), document.body.append(t);
    }
    document.querySelector(".notify").prepend(this._el);
  }
}

// Плавно скрыть с анимацией слайда
const notifySlideUp = (target, duration = 400, showmore = 0) => {
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
const notifySlideDown = (el, duration = 400) => {
  if (!el || el.classList.contains("_slide")) return;

  el.classList.add("_slide");
  el.style.removeProperty("display");
  const display = getComputedStyle(el).display === "none" ? "block" : getComputedStyle(el).display;
  el.style.display = display;
  const height = el.offsetHeight;
  el.style.overflow = "hidden";
  el.style.height = "0";
  el.style.paddingBlock = "0";
  el.style.marginBlock = "0";
  el.offsetHeight;
  el.style.transition = `height ${duration}ms, margin ${duration}ms, padding ${duration}ms`;
  el.style.height = `${height}px`;
  el.style.removeProperty("padding-top");
  el.style.removeProperty("padding-bottom");
  el.style.removeProperty("margin-top");
  el.style.removeProperty("margin-bottom");
  setTimeout(() => {
    el.style.removeProperty("height");
    el.style.removeProperty("overflow");
    el.style.removeProperty("transition");
    el.classList.remove("_slide");
  }, duration);
};

const parseNotifyData = (value = "") => {
  const [title = "", text = "", theme = "info", autohide = "true", interval = "2500"] = value.split(",");

  return {
    title: title.trim(),
    text: text.trim(),
    theme: theme.trim(),
    autohide: autohide.trim() !== "false",
    interval: Number(interval) || 2500,
  };
};

const initNotify = (el) => {
  if (!el?.dataset.notify) return;
  new Notify(parseNotifyData(el.dataset.notify));
};

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-notify]");
  if (!target) return;

  initNotify(target);
});

document.querySelectorAll("[data-notify-default]").forEach(initNotify);

const notify = (title = "", text = "", theme = "info", autohide = true, interval = 2500) => {
  new Notify({ title, text, theme, autohide, interval });
};
