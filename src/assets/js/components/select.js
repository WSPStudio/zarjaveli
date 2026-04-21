/* 
	================================================
	  
	Селекты
	
	================================================
*/

import { allForms } from "../scripts/variables";

export function select() {
  let allSelects = document.querySelectorAll("select");
  let slimSelectInstances = [];

  if (allSelects.length) {
    allSelects.forEach((select) => {
      let instance = new SlimSelect({
        select: select,
        settings: {
          placeholderText: select.getAttribute("data-placeholder") || null,

          // openPosition: 'auto',
          // openPositionX: 'left',

          showSearch: select.hasAttribute("data-search"),
          searchText: "Ничего не найдено",
          searchPlaceholder: "Поиск",
          searchHighlight: true,
          allowDeselect: true,

          maxValuesShown: select.hasAttribute("data-count") ? 2 : false,
          maxValuesMessage: "Выбрано ({number})",

          closeOnSelect: select.hasAttribute("data-not-close") ? false : true,
          // hideSelected: true,
        },
        events: {
          beforeOpen: () => {
            closeAllSelects(instance);
          },
          afterOpen: () => {
            currentOpenSelect = instance;

            if (select.hasAttribute("data-search")) {
              requestAnimationFrame(() => {
                const searchInput = document.querySelector(`.select__content[data-id="${select.getAttribute("data-id")}"] .select__input input`);

                if (searchInput) {
                  searchInput.focus();
                }
              });
            }
          },
          afterClose: () => {
            if (currentOpenSelect === instance) {
              currentOpenSelect = null;
            }
          },
        },
      });

      if (select.hasAttribute("data-open")) {
        requestAnimationFrame(() => {
          instance.open();
        });
      }

      slimSelectInstances.push({ instance, select });

      // prettier-ignore
      const selectAttribures = Array.from(select.attributes)
				.filter((attr) => ![
					"class", "tabindex", "multiple", "data-id", "aria-hidden", "style"]
				.includes(attr.name))
				.map((attr) => `${attr.name}="${attr.value}"`);

      selectAttribures.forEach((attr) => {
        const [name, value] = attr.split("=");
        const selectOptions = document.querySelector(`.select__content[data-id="${select.getAttribute("data-id")}"] .select__options`);
        if (selectOptions) {
          selectOptions.setAttribute(name, value.replace(/"/g, ""));
          if (name === "data-scroll") {
            selectOptions.style.maxHeight = value.replace(/["']/g, "");
          }
        }
      });

      // Закрытие при клике вне селекта
      select.addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex];
        const href = selectedOption.getAttribute("data-href");
        if (href && href !== "#") {
          window.location.href = href;
        }
      });
    });

    let currentOpenSelect = null;

    // Закрытие при скролле
    window.addEventListener("scroll", () => {
      closeAllSelects();
    });

    // Закрытие при клике вне селекта
    document.addEventListener("mousedown", (e) => {
      const clickedSelect = e.target.closest(".select__content") || e.target.closest(".select");
      if (!clickedSelect) {
        closeAllSelects();
      }
    });

    // Сброс формы
    allForms.forEach((form) => {
      form.addEventListener("reset", () => {
        requestAnimationFrame(() => {
          slimSelectInstances.forEach(({ instance, select }) => {
            if (form.contains(select)) {
              if (select.multiple) {
                const selectedValues = Array.from(select.selectedOptions).map((opt) => opt.value);
                instance.setSelected(selectedValues);
              } else {
                instance.setSelected(select.value || "");
              }
            }
          });
        });
      });
    });

    const closeAllSelects = (currentInstance = null) => {
      slimSelectInstances.forEach(({ instance }) => {
        if (instance !== currentInstance) instance.close();
      });
    };
  }
}
