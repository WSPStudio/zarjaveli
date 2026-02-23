window.addEventListener("DOMContentLoaded", () => {
  maskPhone();
});

function maskPhone() {
  const phoneInputs = document.querySelectorAll('[type="tel"]');

  phoneInputs.forEach((input) => {
    input.setAttribute("data-original-placeholder", input.placeholder);

    input.addEventListener("focus", function () {
      // if (!input.value) {
      //   input.value = "+7 (";
      //   input.placeholder = "";
      // }
      setTimeout(() => {
        input.setSelectionRange(input.value.length, input.value.length);
      }, 0);
    });

    input.addEventListener("blur", function () {
      if (input.value == "+7 (") {
        input.value = "";
        input.placeholder = input.getAttribute("data-original-placeholder");
      }
    });

    input.addEventListener("input", function (event) {
      input.setCustomValidity("");

      const isDelete = event.inputType === "deleteContentBackward";
      const raw = input.value;
      const digits = raw.replace(/\D/g, "");

      if (isDelete) {
        return;
      }

      const formatted = formatWithMask(digits);

      input.value = formatted;

      setTimeout(() => {
        const pos = input.value.indexOf("_");
        setCursorPosition(input, pos === -1 ? input.value.length : pos);
      }, 0);
    });

    input.addEventListener("change", function () {
      const digits = input.value.replace(/\D/g, "");
      if (digits.length === 0) {
        input.setCustomValidity("");
        input.classList.remove("error");
        return;
      }

      if (digits.length !== 11) {
        if (input.hasAttribute("required")) {
          input.setCustomValidity("Телефон должен содержать 11 цифр");
        } else {
          input.setCustomValidity("");
        }

        input.classList.add("error");
      } else {
        input.setCustomValidity("");
        input.classList.remove("error");
      }
    });

    input.addEventListener("paste", function (e) {
      e.preventDefault();
      let pasted = (e.clipboardData || window.clipboardData).getData("text");
      pasted = pasted.replace(/\D/g, "");
      input.value = formatWithMask(pasted);
    });
  });
}

function formatWithMask(digits) {
  if (!digits) return "";

  if (digits[0] !== "7" && digits[0] !== "8") {
    digits = "7" + digits;
  }

  const mask = digits[0] === "8" ? "8 (___) ___ __ __" : "+7 (___) ___ __ __";

  let i = 0;
  let formatted = "";

  for (const char of mask) {
    if (i >= digits.length) break;
    if (char === "_" || /\d/.test(char)) {
      formatted += digits[i++];
    } else {
      formatted += char;
    }
  }

  return formatted;
}

function setCursorPosition(el, pos) {
  el.setSelectionRange(pos, pos);
}
