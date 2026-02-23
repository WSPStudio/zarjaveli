
/* 
	================================================
	  
	Таймер
	
	================================================
*/

class CountdownTimer {
	constructor(deadline, cbChange, cbComplete) {
		this._deadline = deadline;
		this._cbChange = cbChange;
		this._cbComplete = cbComplete;
		this._timerId = null;
		this._out = {
			days: '',
			hours: '',
			minutes: '',
			seconds: '',
			daysTitle: '',
			hoursTitle: '',
			minutesTitle: '',
			secondsTitle: ''
		};
		this._start();
	}

	static declensionNum(num, words) {
		return words[(num % 100 > 4 && num % 100 < 20) ? 2 : [2, 0, 1, 1, 1, 2][(num % 10 < 5) ? num % 10 : 5]];
	}

	_start() {
		// счетчик
		this._calc();
		this._timerId = setInterval(this._calc.bind(this), 1000);
	}

	_calc() {
		let diff = this._deadline - new Date();
		let days = diff > 0 ? Math.floor(diff / 1000 / 60 / 60 / 24) : 0;
		let hours = diff > 0 ? Math.floor(diff / 1000 / 60 / 60) % 24 : 0;
		let minutes = diff > 0 ? Math.floor(diff / 1000 / 60) % 60 : 0;
		let seconds = diff > 0 ? Math.floor(diff / 1000) % 60 : 0;

		// добавления 0 в начало и склонение слов
		this._out.days = days < 10 ? '0' + days : days;
		this._out.hours = hours < 10 ? '0' + hours : hours;
		this._out.minutes = minutes < 10 ? '0' + minutes : minutes;
		this._out.seconds = seconds < 10 ? '0' + seconds : seconds;
		this._out.daysTitle = CountdownTimer.declensionNum(days, ['день', 'дня', 'дней']);
		this._out.hoursTitle = CountdownTimer.declensionNum(hours, ['час', 'часа', 'часов']);
		this._out.minutesTitle = CountdownTimer.declensionNum(minutes, ['минута', 'минуты', 'минут']);
		this._out.secondsTitle = CountdownTimer.declensionNum(seconds, ['секунда', 'секунды', 'секунд']);
		this._cbChange ? this._cbChange(this._out) : null;
		if (diff <= 0) {
			clearInterval(this._timerId);
			this._cbComplete ? this._cbComplete() : null;
		}
	}
}

let timers = document.querySelectorAll('.timer');

timers.forEach(timer => {
	let timerId = timer.getAttribute('data-date-id');
	if (!timerId) return;

	// таймер на определенную дату
	if (timer.getAttribute('data-date')) {
		let [dateYear, dateMonth, dateDay] = timer.getAttribute('data-date').split('-');
		initTimer(timer, new Date(dateYear, dateMonth - 1, dateDay), timerId);
	}

	// таймер на определенный период
	if (timer.getAttribute('data-period')) {
		let [days, hours = 0, minutes = 0, seconds = 0] = timer.getAttribute('data-period').split('-');
		let milisecond = (days * 86400000) + (hours * 3600000) + (minutes * 60000) + (seconds * 1000);
		let savedTime = getCookie(`timer_${timerId}`);

		// если нет записи в куки (первый заход на сайт)
		if (!savedTime) {
			updateCookieDate(timerId, milisecond);
			initTimer(timer, new Date(Date.now() + milisecond), timerId);
		} else {
			// если есть запись в куки

			// если нужно перезапустить таймер после окончания
			if (new Date(savedTime).getTime() < Date.now() && (timer.getAttribute('data-repeat') != null)) {
				updateCookieDate(timerId, milisecond);
				initTimer(timer, new Date(Date.now() + milisecond), timerId);
			} else {
				initTimer(timer, new Date(savedTime), timerId);
			}
		}
	}
});

function initTimer(timer, result, timerId) {
	new CountdownTimer(result, (item) => {
		let timerDays = timer.querySelector('.timer__item-days');
		let timerHours = timer.querySelector('.timer__item-hours');
		let timerMinutes = timer.querySelector('.timer__item-minutes');
		let timerSeconds = timer.querySelector('.timer__item-seconds');

		// время
		timerDays.textContent = item.days;
		timerHours.textContent = item.hours;
		timerMinutes.textContent = item.minutes;
		timerSeconds.textContent = item.seconds;

		// подписи
		timerDays.nextElementSibling.textContent = item.daysTitle;
		timerHours.nextElementSibling.textContent = item.hoursTitle;
		timerMinutes.nextElementSibling.textContent = item.minutesTitle;
		timerSeconds.nextElementSibling.textContent = item.secondsTitle;
	});
}

// обновление записи в куки
function updateCookieDate(timerId, milisecond) {
	document.cookie = `timer_${timerId}=${new Date(Date.now() + milisecond)}; path=/`;
}

// получение записи из куки
function getCookie(name) {
	let matches = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
	return matches ? matches[1] : null;
}
