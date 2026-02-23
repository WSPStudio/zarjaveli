//
//
//
//
// Куки

// Установки куки
export function setCookie(name, value, hours = 24) {
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}`;
}

// Получение куки
export function getCookie(name) {
  const cookies = document.cookie.split("; ").reduce((acc, cookie) => {
    let [key, value] = cookie.split("=");
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});

  let cookieValue = cookies[name] || null;
  return cookieValue;
}

// Удаление куки
export function deleteCookie(name) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
