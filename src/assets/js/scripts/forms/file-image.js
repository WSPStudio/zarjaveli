// Отображение загружаемого фото 
let imageInputs = document.querySelectorAll(".input-image");

imageInputs.forEach(input => {
	let inputImageImg = input.querySelector(".input-image__img");
	let inputImageText = input.querySelector(".input-image__text");
	let inputImageRemove = input.querySelector(".input-image__remove");

	input.querySelector('input').addEventListener("change", function (e) {
		let inputTarget = e.target;
		let file = inputTarget.files[0];

		if (file) {
			inputImageRemove.classList.add('active')
			let reader = new FileReader();

			reader.addEventListener("load", function (e) {
				let img = document.createElement("img");
				img.src = e.target.result;

				let temp = inputImageText.textContent;
				inputImageText.textContent = inputImageText.getAttribute('data-refresh-text');
				inputImageText.setAttribute('data-refresh-text', temp);
				inputImageImg.appendChild(img);
			});

			reader.readAsDataURL(file);
		}
	});

	inputImageRemove.addEventListener('click', (e) => {
		inputImageRemove.classList.remove('active')
		input.querySelector('input').value = '';
		inputImageImg.innerHTML = '';

		let temp = inputImageText.textContent;
		inputImageText.textContent = inputImageText.getAttribute('data-refresh-text');
		inputImageText.setAttribute('data-refresh-text', temp);
	});
});
