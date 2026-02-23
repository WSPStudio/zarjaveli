import { windowWidth, checkWindowWidth } from "../variables.js";

// Задержка при вызове функции. Выполняется в конце
export function debounce(fn, delay) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, arguments), delay);
  };
}

window.addEventListener("resize", debounce(checkWindowWidth, 100));

// Задержка при вызове функции. Выполняется раз в delay мс
export function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// Случайное число в диапазоне
export function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

// Уникализация массива
export function uniqArray(array) {
  return array.filter(function (item, index, self) {
    return self.indexOf(item) === index;
  });
}

// Установить курсор на последний символ
export function setCaret(item) {
  let data = item.value;
  item.focus();
  item.value = "";
  item.value = data;
}

// Закрытие элемента при клике вне него
export function closeOutClick(closedElement, clickedButton, clickedButtonActiveClass, callback) {
  document.addEventListener("click", (e) => {
    const button = document.querySelector(clickedButton);
    const element = document.querySelector(closedElement);
    const withinBoundaries = e.composedPath().includes(element);

    if (!withinBoundaries && button?.classList.contains(clickedButtonActiveClass) && e.target !== button && !e.target.closest(".modal")) {
      button.click();
      // element.classList.remove('active');
      // button.classList.remove(clickedButtonActiveClass);

      if (typeof callback === "function") {
        callback();
      }
    }
  });
}

//
//
//
//
// Позиционирование

// Отступ элемента от краев страницы
export function offset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  return {
    top: rect.top + scrollTop,
    left: rect.left + scrollLeft,
    right: windowWidth - rect.width - (rect.left + scrollLeft),
  };
}

// Сторона страницы
export function getPageSide(item) {
  if (offset(item).left > windowWidth / 2) {
    return "right";
  } else {
    return "left";
  }
}

//
//
//
//
// Массивы

// Индекс элемента
export function indexInParent(node) {
  let children = node.parentNode.childNodes;
  let num = 0;
  for (var i = 0; i < children.length; i++) {
    if (children[i] == node) return num;
    if (children[i].nodeType == 1) num++;
  }
  return -1;
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

  if (typeof query === "object") {
    elements = query;
  } else {
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
