import { allForms, body } from "../variables";
import { fadeIn, fadeOut } from "../ui/animation";

//
//
//
//
// Валидация элементов формы

export function validation() {
  let inputs = document.querySelectorAll("input, textarea");

  inputs.forEach((input) => {
    if (!input) return;

    const parentElement = input.parentElement;

    const updateActiveState = () => {
      if (input.type === "text" || input.type === "date") {
        parentElement.classList.toggle("active", input.value.length > 0);
      }
    };

    // Валидация ФИО
    const validateFIOField = () => {
      const nameAttr = input.name.toLowerCase() || "";
      const placeholder = input.placeholder.toLowerCase() || "";
      const fioKeywords = ["имя", "фамилия", "отчество"];
      const isFIO = nameAttr.includes("name") || fioKeywords.some((word) => placeholder.includes(word));

      if (isFIO) {
        input.value = input.value.replace(/[^а-яА-ЯёЁ\s]/g, "");
        input.value = input.value.replace(/\s{2,}/g, " ");
      }
    };

    input.addEventListener("keyup", updateActiveState);

    input.addEventListener("change", () => {
      input.classList.remove("wpcf7-not-valid");
      updateActiveState();

      if (input.type === "email") {
        const value = input.value.trim();

        if (!value) {
          input.setCustomValidity("");
          return;
        }

        const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

        if (!emailPattern.test(value)) {
          input.setCustomValidity("Введите корректный email");
        } else {
          input.setCustomValidity("");
        }
      }
    });

    input.addEventListener("input", () => {
      if (input.getAttribute("data-number")) {
        input.value = input.value.replace(/\D/g, "").replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
      }

      if (input.type === "email") {
        input.value = input.value.replace(/[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~@-]/g, "");
      }

      validateFIOField();
    });

    input.addEventListener("paste", (e) => {
      setTimeout(() => {
        if (input.type === "email") {
          input.value = input.value.replace(/[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~@-]/g, "");
        }
        validateFIOField();
        updateActiveState();
      }, 0);
    });
  });
}

validation();

export function clearInputs() {
  inputs.forEach((element) => {
    element.classList.remove("wpcf7-not-valid", "error");
  });
}

export function checkInputDateValue(input) {
  input.classList.toggle("empty", input.value.length === 0);
}

// Проверка формы перед отправкой
export function initFormValidation(form) {
  const getHasChoiceValue = () => {
    const requiredChoice = form.querySelectorAll("[data-required-choice]");

    return Array.from(requiredChoice).some((input) => {
      if (input.type === "tel") {
        return input.value.replace(/\D/g, "").length >= 11;
      }

      return input.value.trim() !== "";
    });
  };

  const updateRequiredChoice = () => {
    const hasChoiceValue = getHasChoiceValue();
    const requiredChoice = form.querySelectorAll("[data-required-choice]");

    requiredChoice.forEach((input) => {
      if (hasChoiceValue) {
        input.removeAttribute("required");
        input.setCustomValidity("");
      } else {
        input.setAttribute("required", "true");
      }
    });
  };

  updateRequiredChoice();

  form.addEventListener(
    "submit",
    (e) => {
      let isValid = true;

      updateRequiredChoice();

      const hasChoiceValue = getHasChoiceValue();
      const inputTel = form.querySelector('input[type="tel"]');

      if (inputTel) {
        const digits = inputTel.value.replace(/\D/g, "");

        if (!hasChoiceValue && digits.length > 0 && digits.length !== 11) {
          e.preventDefault();
          isValid = false;
        } else {
          inputTel.setCustomValidity("");
        }
      }

      if (!isValid || !form.checkValidity()) {
        e.preventDefault();
      }
    },
    {
      capture: true,
    }
  );

  const requiredChoice = form.querySelectorAll("[data-required-choice]");

  requiredChoice.forEach((input) => {
    input.addEventListener("input", updateRequiredChoice);
  });
}

if (allForms) {
  allForms.forEach((form) => {
    initFormValidation(form);
  });
}

// После отправки формы
export function successSubmitForm(form) {
  fadeOut(".modal");

  setTimeout(() => {
    fadeIn(".modal-thank");
  }, modalInterval - 500);

  setTimeout(() => {
    fadeOut(".modal");
  }, modalInterval * 2);

  setTimeout(() => {
    body.classList.remove("no-scroll");
  }, modalInterval * 3);

  // form.reset();

  // const originalPlaceholders = form.querySelectorAll("[data-original-placeholder]");

  // if (originalPlaceholders) {
  //   originalPlaceholders.forEach((input) => {
  //     input.placeholder = input.getAttribute("data-original-placeholder");
  //   });
  // }
}

if (typeof window !== "undefined") {
  window.successSubmitForm = successSubmitForm;
}

// Валидация поля Телефон или Почта
const inputs = document.querySelectorAll("[data-tel-or-email]");

inputs.forEach((input) => {
  let mode = "";
  const originalPlaceholder = input.placeholder;

  input.addEventListener("input", (e) => {
    input.setCustomValidity("");

    let val = input.value;

    if (val.includes("+")) {
      const firstPlus = val.indexOf("+");
      val = (firstPlus === 0 ? "+" : "") + val.replace(/\+/g, "").trim();
      input.value = val;
    }

    const trimmed = val.trim();
    const hasAt = trimmed.includes("@");
    const hasLetter = /[a-zA-Zа-яА-Я]/.test(trimmed);
    const digitsOnly = trimmed.replace(/\D/g, "");
    const startsLikePhone = /^[\+78]/.test(trimmed);
    const isPhone = digitsOnly.length >= 4 && !hasLetter && !hasAt && val !== "+";

    if ((startsLikePhone || isPhone) && !hasLetter && !hasAt) {
      if (mode !== "phone") {
        mode = "phone";
        input.type = "tel";
        input.placeholder = "";
      }
      maskPhone();
    } else {
      if (mode !== "email") {
        mode = "email";
        input.type = "email";
        input.placeholder = originalPlaceholder;
      }
      validation();
    }
  });
});
