/* 
	================================================
	  
	Перенос данных в элементы
	
	================================================
*/

import { checkBurgerAndMenu } from "../scripts/core/checks";

export function text() {
  let dataText = document.querySelectorAll("[data-text]");

  dataText.forEach((dataTextItem) => {
    dataTextItem.addEventListener("click", function () {
      let text = this.getAttribute("data-text")
        .replace(/\s{2,}/g, " ")
        .split(";");

      text.forEach((element) => {
        let items = element.split("|"); // Если несколько

        items.forEach((item) => {
          let parent = item.split(",")[0].trim(); // Родитель
          let children = item.split(",")[1].trim(); // Дочерний (из которого берется контент)
          let where = item.split(",")[2].trim(); // Куда вставлять

          let issetParent = this.closest(parent)?.length != 0; // Если есть родитель

          // Если класс во втором параметре совпадает с классом элемента, на который кликнули
          let isClassMatch = (() => {
            const cleanSelector = children.replace(/\[\d+\]$/, "");
            return cleanSelector.startsWith(".") && this.classList.contains(cleanSelector.substring(1));
          })();

          let isNotInput = document.querySelector(where).tagName != "INPUT"; // Если тег, куда будет вставляться контент != input

          let searchInChildren;

          let target = this.closest(parent)?.querySelector(children);

          searchInChildren = target ? target[isNotInput ? "innerHTML" : "value"] : false; // Если элемент, из которого берется контент находится внутри элемента, на который кликнули

          // Если элемент, из которого берется контент равен элементу, на который кликнули
          let searchInThis = (() => {
            const match = children.match(/(.*?)(?:\[(\d+)\])?$/);
            const elements = document.querySelectorAll(match[1]);
            return elements[match[2] ? parseInt(match[2]) : 0]?.innerHTML;
          })();

          // Если нужно переместить весь блок целиком
          if (parent == children) {
            document.querySelector(where).innerHTML = `${this.closest(parent).outerHTML}`;
          }

          // Если нужно вставить в src
          if (document.querySelector(where).tagName == "IMG" && document.querySelector(children).tagName == "IMG") {
            document.querySelector(where).style.opacity = "0";
            document.querySelector(where).src = document.querySelector(children).getAttribute("src");

            setTimeout(() => {
              document.querySelector(where).style.opacity = "1";
            }, 300);
          } else {
            if ((issetParent && isNotInput && isClassMatch && searchInThis) || (!issetParent && isNotInput && isClassMatch && searchInThis)) {
              document.querySelector(where).innerHTML = searchInThis;
            }

            if ((issetParent && isNotInput && !isClassMatch && searchInChildren) || (!issetParent && isNotInput && !isClassMatch && searchInChildren)) {
              document.querySelector(where).innerHTML = searchInChildren;
            }

            if ((issetParent && !isNotInput && isClassMatch && searchInThis) || (!issetParent && !isNotInput && isClassMatch && searchInThis)) {
              document.querySelector(where).value = searchInThis;
            }

            if ((issetParent && !isNotInput && !isClassMatch && searchInChildren) || (!issetParent && !isNotInput && !isClassMatch && searchInChildren)) {
              document.querySelector(where).value = searchInChildren;
            }

            if (where.charAt(0) == "a") {
              // Если нужно вставить в href
              document.querySelector(where).setAttribute("href", document.querySelector(children).getAttribute("href"));
            }
          }
        });
      });
    });
  });
}

text();
