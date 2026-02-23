/* 
  ================================================
	  
  Галерея
	
  ================================================
*/

export function viewer() {
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
