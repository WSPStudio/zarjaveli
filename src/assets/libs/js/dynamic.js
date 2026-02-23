class TransferElements {
	constructor(...objectsWithParameters) {
		if (objectsWithParameters.length === 0) {
			throw TypeError('at least one object with parameters must be specified for the constructor');
		}

		const sourceElementsData = [];

		const validatedObjectsWithParameters = objectsWithParameters.map(
			(objectWithParameters) => {
				if (
					this.#getObjectType(objectWithParameters) !== '[object Object]'
				) {
					throw TypeError(`the arguments specified for the constructor must be objects of type 'Object'`);
				}

				['sourceElement', 'breakpoints'].forEach((parameterKey) => {
					if (!(Object.hasOwn(objectWithParameters, parameterKey))) {
						throw TypeError(`the '${parameterKey}' parameter is not specified for the main object`);
					}
				});

				const { sourceElement, breakpoints } = objectWithParameters;

				if (!(sourceElement instanceof Element)) {
					throw TypeError(`the value specified for the 'sourceElement' parameter must be an object of type 'Element'`);
				}

				if (sourceElementsData.some(data => data.sourceElement === sourceElement)) {
					throw TypeError(`there can only be one object in the constructor with such a 'sourceElement': '${sourceElement.cloneNode().outerHTML}'`);
				}

				const initialParent = sourceElement.parentElement;
				const initialNextSibling = sourceElement.nextElementSibling;

				sourceElementsData.push({
					sourceElement,
					initialParent,
					initialNextSibling
				});

				objectWithParameters.breakpoints = this.#assembleBreakpoints(
					breakpoints,
					sourceElement
				);

				return objectWithParameters;
			}
		);

		const sortedBreakpointTriggers = [...(
			validatedObjectsWithParameters.reduce(
				(collection, { breakpoints }) => {
					Object.keys(breakpoints).forEach((breakpointTrigger) => {
						if (Number(breakpointTrigger)) {
							collection.add(breakpointTrigger);
						}
					});

					return collection;
				},

				new Set()
			).add('default')
		)].sort((a, b) => a - b);

		const storageOfBreakpoints = sortedBreakpointTriggers.reduce(
			(storage, breakpointTrigger) => {
				storage.set(breakpointTrigger, []);

				return storage;
			},

			new Map()
		);

		validatedObjectsWithParameters.forEach(
			({ sourceElement, breakpoints }) => {
				Object.entries(breakpoints).forEach(
					([breakpointTrigger, { targetElement, targetPosition }]) => {
						storageOfBreakpoints.get(breakpointTrigger).push({
							sourceElement,
							targetElement,
							targetPosition
						});
					}
				);
			}
		);

		storageOfBreakpoints.forEach((breakpointObjects) => {
			this.#sortBreakpointObjects(breakpointObjects);
			this.#removeSourceElements(breakpointObjects);
			this.#insertSourceElements(breakpointObjects, true);
			breakpointObjects.length = 0;
			sourceElementsData.forEach(({ sourceElement }) => {
				breakpointObjects.push(this.#generateBreakpointObject(
					sourceElement,
					true
				));
			});
			this.#sortBreakpointObjects(breakpointObjects);
		});

		let previousBreakpointTrigger = 'default';

		const resizeObserver = new ResizeObserver(
			([{ borderBoxSize: [{ inlineSize }], target }]) => {
				const currentWidth = inlineSize + this.#getScrollbarWidth(target);
				const currentBreakpointTrigger = this.#getBreakpointTrigger(
					sortedBreakpointTriggers,
					currentWidth
				);

				if (previousBreakpointTrigger !== currentBreakpointTrigger) {
					const breakpointObjects = storageOfBreakpoints.get(
						currentBreakpointTrigger
					);

					this.#removeSourceElements(breakpointObjects);

					if (currentBreakpointTrigger === 'default') {
						sourceElementsData.forEach(({ sourceElement, initialParent, initialNextSibling }) => {
							if (initialParent) {
								try {
									if (initialNextSibling && initialNextSibling.parentNode === initialParent) {
										initialParent.insertBefore(sourceElement, initialNextSibling);
									} else {
										initialParent.appendChild(sourceElement);
									}
								} catch (e) {
									console.error('TransferElements: insertBefore failed', {
										sourceElement,
										initialParent,
										initialNextSibling,
										error: e
									});
									initialParent.appendChild(sourceElement);
								}
							}
						});
					} else {
						this.#insertSourceElements(breakpointObjects, false);
					}

					previousBreakpointTrigger = currentBreakpointTrigger;
				}
			}
		);

		resizeObserver.observe(document.documentElement);
	}

	#assembleBreakpoints(breakpoints, sourceElement) {
		if (this.#getObjectType(breakpoints) !== '[object Object]') {
			throw TypeError(`the value specified for the 'breakpoints' parameter must be an object of type 'Object'`);
		}

		const breakpointEntries = Object.entries(breakpoints);

		if (breakpointEntries.length === 0) {
			throw TypeError(`at least one breakpoint must be specified for the 'breakpoints' object`);
		}

		const validatedBreakpoints = Object.fromEntries(
			breakpointEntries.map(
				([breakpointTrigger, breakpointObject]) => {
					const breakpointTriggerAsNumber = Number(breakpointTrigger);

					if (
						!breakpointTriggerAsNumber ||
						breakpointTriggerAsNumber <= 0 ||
						breakpointTriggerAsNumber > Number.MAX_SAFE_INTEGER
					) {
						throw RangeError(`the breakpoint trigger must be a safe (integer or fractional) number greater than zero`);
					}

					if (this.#getObjectType(breakpointObject) !== '[object Object]') {
						throw TypeError(`the breakpoint object must be of type 'Object'`);
					}

					if (!Object.hasOwn(breakpointObject, 'targetElement')) {
						throw TypeError(`the 'targetElement' parameter is not specified for the breakpoint object`);
					}

					const { targetElement, targetPosition } = breakpointObject;

					if (!(targetElement instanceof Element)) {
						throw TypeError(`the value specified for the 'targetElement' parameter must be an object of type 'Element'`);
					}

					if (sourceElement === targetElement) {
						throw TypeError(`the value specified for the 'targetElement' parameter must be different from the value specified for the 'sourceElement' parameter`);
					}

					if (this.#isTargetElementDescendantOfSourceElement(
						targetElement, sourceElement
					)) {
						throw TypeError(`the element that is specified as the value for the 'targetElement' parameter must not be a descendant of the element specified as the value for the 'sourceElement' parameter`);
					}

					if (this.#isTagOfTargetElementSelfClosing(targetElement)) {
						throw TypeError(`the element specified as the value for the 'targetElement' parameter must be a paired tag`);
					}

					let targetPos = typeof breakpointTrigger == 'number' ? breakpointTrigger : 0;

					if (typeof breakpointTrigger != 'number') {
						if (breakpointTrigger == 'first') {
							targetPos = 0
						} else if (breakpointTrigger == 'last') {
							targetPos = targetElement.children.length;
						} else {
							targetPos = 0;
						}
					}

					return [
						breakpointTriggerAsNumber,
						{
							targetPosition: targetPos,
							...breakpointObject
						}
					];
				}
			)
		);

		validatedBreakpoints.default = this.#generateBreakpointObject(
			sourceElement,
			false
		);

		return validatedBreakpoints;
	}

	#getChildElementsOfTargetElement(targetElement) {
		return targetElement.children;
	}

	#getBreakpointTrigger(breakpointTriggers, currentWidth) {
		let startIndex = 0;
		let endIndex = breakpointTriggers.length - 2;
		let savedBreakpointTrigger;

		while (startIndex <= endIndex) {
			const middleIndex = Math.floor((startIndex + endIndex) / 2);
			const guessedBreakpointTrigger = breakpointTriggers[middleIndex];

			if (guessedBreakpointTrigger == currentWidth) {
				return guessedBreakpointTrigger;
			} else if (guessedBreakpointTrigger > currentWidth) {
				endIndex = middleIndex - 1;
			} else {
				startIndex = middleIndex + 1;
			}

			if ((guessedBreakpointTrigger - currentWidth) > 0) {
				savedBreakpointTrigger = guessedBreakpointTrigger;
			}
		}

		return savedBreakpointTrigger ?? 'default';
	}

	#getScrollbarWidth(observableElement) {
		const viewportWidth = window.innerWidth;
		const widthOfObservableElement = Math.min(
			observableElement.clientWidth,
			observableElement.offsetWidth
		);

		let scrollbarWidth = 0;

		if (widthOfObservableElement !== viewportWidth) {
			scrollbarWidth += viewportWidth - widthOfObservableElement;
		}

		return scrollbarWidth;
	}

	#getObjectType(object) {
		return Object.prototype.toString.call(object);
	}

	#isTargetElementDescendantOfSourceElement(
		targetElement,
		sourceElement
	) {
		while (targetElement = targetElement.parentElement) {
			if (targetElement === sourceElement) {
				return true;
			}
		}

		return false;
	}

	#isTagOfTargetElementSelfClosing(targetElement) {
		return !new RegExp(/<\/[a-zA-Z]+>$/).test(targetElement.outerHTML);
	}

	#sortBreakpointObjects(breakpointObjects) {
		if (breakpointObjects.length > 1) {
			breakpointObjects.sort((a, b) => (
				a.targetPosition - b.targetPosition
			));
		}
	}

	#removeSourceElements(breakpointObjects) {
		breakpointObjects.forEach(({ sourceElement }) => {
			sourceElement.remove();
		});
	}

	#insertSourceElements(
		breakpointObjects,
		hasCheckOfMaximumTargetPosition
	) {
		breakpointObjects.forEach(
			({ sourceElement, targetElement, targetPosition }) => {
				const childElementsOfTargetElement = (
					this.#getChildElementsOfTargetElement(targetElement)
				);

				if (hasCheckOfMaximumTargetPosition) {
					this.#throwExceptionIfMaximumTargetPositionIsExceeded(
						childElementsOfTargetElement,
						targetPosition
					);
				}

				const childElementOfTargetElement = (
					childElementsOfTargetElement[targetPosition]
				);

				if (childElementOfTargetElement && childElementOfTargetElement.parentNode === targetElement) {
					targetElement.insertBefore(sourceElement, childElementOfTargetElement);
				} else {
					targetElement.append(sourceElement);
				}

			}
		);
	}

	#throwExceptionIfMaximumTargetPositionIsExceeded(
		childElementsOfTargetElement,
		targetPosition
	) {
		const maximumTargetPosition = childElementsOfTargetElement.length;
	}

	#generateBreakpointObject(sourceElement, isComplete) {
		const parentElementOfSourceElement = sourceElement.parentElement;
		const currentIndex = parentElementOfSourceElement ? Array.from(parentElementOfSourceElement.children).indexOf(sourceElement) : -1;

		const breakpointObject = {
			targetElement: parentElementOfSourceElement,
			targetPosition: currentIndex
		};

		if (isComplete) {
			breakpointObject.sourceElement = sourceElement;
		}

		return breakpointObject;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	let dataDa = document.querySelectorAll('[data-da]');

	dataDa.forEach(item => {
		let daMedia = item.getAttribute('data-da').split('|');
		let breakpoints = {};

		daMedia.forEach(media => {
			let [daTarget, daBreakpoint, daPos] = media.split(',');

			if (daPos === 'first') daPos = 0;

			function getTargetElement(selector, context = document) {
				let parts = selector.trim().split(' ');
				let currentContext = context;

				for (let part of parts) {
					let match = part.match(/(.+?)\[(\d+)\]/);
					if (match) {
						let baseSelector = match[1];
						let index = parseInt(match[2]);
						let elements = currentContext.querySelectorAll(baseSelector);
						currentContext = elements[index] || null;
					} else {
						currentContext = currentContext.querySelector(part);
					}
					if (!currentContext) break;
				}
				return currentContext;
			}

			let daTargetElement = getTargetElement(daTarget);

			if (daTargetElement) {
				breakpoints[daBreakpoint] = {
					targetElement: daTargetElement,
					targetPosition: daPos
				};
			}
		});

		new TransferElements({
			sourceElement: item,
			breakpoints: breakpoints
		});
	});
});
