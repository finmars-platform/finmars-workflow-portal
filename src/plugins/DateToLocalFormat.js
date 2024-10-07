import Notifications from "@kyvg/vue3-notification";
export default defineNuxtPlugin((nuxtApp) => {

	// Date formatting function
	nuxtApp.vueApp.config.globalProperties.$formatDate = (isoDateString, opts = {}) => {
		if (!isoDateString) return '';

		const date = new Date(isoDateString);

		const options = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			timeZoneName: 'short',
			...opts  // Allow overriding default formatting options
		};

		return date.toLocaleString(undefined, options);
	};

});
