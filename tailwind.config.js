// import { default as tailwindCssVariables } from "./tailwind/cssVariablesPlugin.tw";

export default {
  content: [
	  "./src/**/*.{vue,js}",
	  "./node_modules/@finmars/ui/dist/finmars-ui.css",
	  "./node_modules/@finmars/ui/dist/finmars-ui.es.js",
  ],
  theme: {
    extend: {

	},
  },
  plugins: [ ],
}

