import {tailwindCssVariables} from "@finmars/ui";

export default {
  content: [
	  "./src/**/*.{vue,js}",
	  "./node_modules/@finmars/ui/dist/finmars-ui.css",
	  "./node_modules/@finmars/ui/dist/finmars-ui.es.js",
  ],
  theme: {
    /*extend: {
		colors: {
			pageBackground: 'var(--page-background-color)',
			secondary: 'var(--secondary-color)',
			tableBorder: 'var(--table-border-color)',
			baseBackground: 'var(--base-backgroundColor)',
			stateActiveBackground: 'var(--state-active-background-color)',
			cardBackground: 'var(--card-background-color)',
			cardBorder: 'var(--card-border-color)',
			primary: 'var(--primary-color)',
		},
		boxShadow: {
			card: '0 1px 4px var(--shadow-color)',
		},
	},*/
  },
  plugins: [
	  tailwindCssVariables
  ],
}

