export function useDebounce(func, wait, immediate) {

	var timeout;
	return function () {
		var context = this, args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};

}

export const useToggleDarkMode = (darkMode=false) => {
	document.body.classList.toggle('dark', darkMode);
}

