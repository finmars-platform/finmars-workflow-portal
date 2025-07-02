import {uiComponentsPlugin} from "@finmars/ui"

export default defineNuxtPlugin((nuxtApp) => {

	console.log('uiComponentsPlugin', uiComponentsPlugin);

	nuxtApp.vueApp.use(uiComponentsPlugin)
})
