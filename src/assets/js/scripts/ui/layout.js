import { headerTop } from "../variables";

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
