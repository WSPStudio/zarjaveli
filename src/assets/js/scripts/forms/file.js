
// Замена текста при выборе файла 
export function formFiles() {
	document.querySelectorAll('.input-file').forEach(wrapper => {
		const input = wrapper.querySelector('input')
		const textEl = wrapper.querySelector('.input-file-text')
		const defaultText = textEl.textContent
		const form = wrapper.closest('form')
		let dragCounter = 0

		const allowedExt = (input.getAttribute('accept') || '')
			.split(',')
			.map(e => e.trim().replace(/^\./, '').toLowerCase())
			.filter(e => e)

		const isAllowed = file =>
			allowedExt.includes(file.name.split('.').pop().toLowerCase())

		const filterFiles = files =>
			Array.from(files).filter(f => isAllowed(f))

		const updateFileText = () => {
			if (!input.files.length) {
				textEl.textContent = defaultText
				return
			}
			const names = Array.from(input.files).map(f => f.name).join(', ')
			textEl.textContent = names
		}

		input.addEventListener('change', () => {
			const filtered = filterFiles(input.files)
			if (filtered.length !== input.files.length) {
				form?.classList.add('form-dragover-error')
				const dataTransfer = new DataTransfer()
				filtered.forEach(f => dataTransfer.items.add(f))
				input.files = dataTransfer.files
			}
			updateFileText()
		})

		form?.addEventListener('reset', () => {
			textEl.textContent = defaultText
		})

		const hasDisallowedDragItems = dt => {
			if (!dt?.items?.length) return false

			const allowedExt = (input.getAttribute('accept') || '')
				.split(',')
				.map(e => e.trim().replace(/^\./, '').toLowerCase())
				.filter(Boolean)

			const mimeMap = {
				'plain': 'txt'
			}

			return Array.from(dt.items).some(item => {
				if (item.kind !== 'file') return false

				const file = item.getAsFile?.()
				if (file) {
					const ext = file.name.split('.').pop().toLowerCase()
					return !allowedExt.includes(ext)
				}

				if (item.type) {
					let mimeExt = item.type.split('/').pop().toLowerCase()
					if (mimeMap[mimeExt]) {
						mimeExt = mimeMap[mimeExt]
					}
					return !allowedExt.includes(mimeExt)
				}

				return false
			})
		}

		form?.addEventListener('dragenter', e => {
			e.preventDefault()
			dragCounter++
			form.classList.add('form-dragover')
			if (hasDisallowedDragItems(e.dataTransfer)) {
				form.classList.add('form-dragover-error')
			} else {
				form.classList.remove('form-dragover-error')
			}
		})

		form?.addEventListener('dragleave', e => {
			e.preventDefault()
			dragCounter--
			if (dragCounter === 0) {
				form.classList.remove('form-dragover', 'form-dragover-error')
			}
		})

		form?.addEventListener('dragover', e => {
			e.preventDefault()
			if (hasDisallowedDragItems(e.dataTransfer)) {
				form.classList.add('form-dragover-error')
			} else {
				form.classList.remove('form-dragover-error')
			}
		})

		form?.addEventListener('drop', e => {
			e.preventDefault()
			dragCounter = 0
			form.classList.remove('form-dragover', 'form-dragover-error')

			if (e.dataTransfer.files.length) {
				const filtered = filterFiles(e.dataTransfer.files)
				const dataTransfer = new DataTransfer()
				filtered.forEach(f => dataTransfer.items.add(f))
				input.files = dataTransfer.files
				updateFileText()
			}
		})
	})
}
