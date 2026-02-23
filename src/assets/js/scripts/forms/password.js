

// Показать пароль
let passwordButtons = document.querySelectorAll('.password__icon');

passwordButtons.forEach(button => {
	button.addEventListener('click', function (e) {
		e.preventDefault()
		let inputType = button.classList.contains('active') ? 'password' : 'text'
		button.previousElementSibling.setAttribute('type', inputType)
		button.classList.toggle('active')
	});
});

