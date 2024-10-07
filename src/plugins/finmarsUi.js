import {uiComponentsPlugin} from "@finmars/ui"

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(uiComponentsPlugin)
})
