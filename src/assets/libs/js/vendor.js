import "./dynamic.js";
import "./viewer.js";
import "./mask.js";
import "./wow.js";

import Swiper from "swiper";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
Swiper.use([Pagination, Navigation, Autoplay]);
window.Swiper = Swiper;

/*
// Autoplay; 					// автопрокрутка
// EffectFade; 				// эффект fade
// Keyboard; 					// управление клавишами
// Navigation; 				// стрелки Next/Prev
// Pagination; 				// bullets, fraction, progressbar
// Controller; 				// связывание нескольких слайдеров
// FreeMode; 					// свободное пролистывание
// Grid; 							// сетка слайдов
// Lazy; 							// lazy-load изображений
// Mousewheel; 				// управление колесиком мыши
// PaginationDynamic; // динамические bullets
// Scrollbar; 				// scroll bar
// Thumbs; 						// миниатюры (thumbnails)
// A11y; 							// accessibility (a11y)
// EffectCube; 				// 3D-куб
// EffectFlip; 				// 3D-flip
// EffectCoverflow; 	// эффект coverflow
// History; 					// управление браузерной историей
// HashNavigation; 		// навигация по hash
// Manipulation; 			// add/remove slides dynamically
// Parallax; 					// parallax эффект
// Virtual; 					// виртуальные слайды
// Zoom; 							// zoom
*/
