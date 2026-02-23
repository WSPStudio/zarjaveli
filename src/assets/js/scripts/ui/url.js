
//
//
//
//
// Работа с url

// Получение хэша
export function getHash() {
	return location.hash ? location.hash.replace('#', '') : '';
}

// Удаление хэша
export function removeHash() {
	setTimeout(() => {
		history.pushState("", document.title, window.location.pathname + window.location.search);
	}, 100);
}

// Установка хэша
export function setHash(hash) {
	hash = hash ? `#${hash}` : window.location.href.split('#')[0];
	history.pushState('', '', hash);
}

// Получение параметров
export function getParameters() {
	const params = new URLSearchParams(window.location.search);
	const map = new Map();
	params.forEach((value, key) => {
		map.set(key, value);
	});
	return map;
}
