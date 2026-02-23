/* 
	================================================
	  
	Карты
	
	================================================
*/

export function map() {
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

export function waitForTilesLoad(layer) {
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

export function getTileContainer(layer) {
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
