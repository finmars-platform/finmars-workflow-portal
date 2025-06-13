import dayjs from 'dayjs'

export default defineNuxtConfig({
	build: {
		publicPath: process.env.NUXT_APP_BUILD_ASSETS_DIR || '/_nuxt/'
	},

	runtimeConfig: {
		public: {
			frontURL: process.env.FRONT_HOST || "==PROD_FRONT_HOST==",
			apiURL: process.env.API_HOST || "==PROD_API_HOST==",
			// wsURL: (process.env.WS_HOST  || "==PROD_WS_HOST==") + '/ws',

			authorizerURL: process.env.AUTH_HOST || "==PROD_API_HOST==" + "/authorizer",

			KEYCLOAK_URL: process.env.KEYCLOAK_URL || "==PROD_KEYCLOAK_URL==",
			KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || "==PROD_KEYCLOAK_REALM==",
			KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || "==PROD_KEYCLOAK_CLIENT_ID==",

			buildDATE: dayjs().format('HH:mm DD/MM/YYYY'),
			EDITION_TYPE: process.env.EDITION_TYPE || '==PROD_EDITION_TYPE=='
		}
	},

	ssr: false,

	imports: {
		dirs: [
			'stores',
			'composables/evRv/*.js',

		]
	},

	app: {
		head: {
			title: 'Finmars',
			viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
			charset: 'utf-8',
			link: [{rel: 'icon', type: 'image/png', href: 'img/favicon.png'}]
		},
		pageTransition: {name: 'page', mode: 'out-in'}
	},

	modules: [
		'@pinia/nuxt',
		"@nuxtjs/tailwindcss",
		'floating-vue/nuxt'
	],

	pinia: {
		/* Options for @pinia/nuxt */
	},

	css: [
		"~/assets/css/material-icons.css",
		'@finmars/ui/dist/finmars-ui.css',
		"~/assets/css/main.css",
	],

	postcss: {
		plugins: {
			'postcss-mixins': {},
		}
	},

	vite: {
		define: {
			"process.env.DEBUG": false,
		},
		plugins: []
	},

	srcDir: "src",

	hooks: {
		'pages:extend': (pages) => {

			const pagesToRemove: string[] = [];

			pages.forEach((page, index) => {

				// do not create pages for components whose names start with "_"
				if (page.path.search(/\/_./) > -1) {

					pagesToRemove.push(page.path);
					return;

				}

				page.path = '/:realm_code/:space_code/w' + page.path

			})

			pagesToRemove.forEach(pagePath => {

				const pageIndex = pages.findIndex(
					page => page.path === pagePath
				);

				pages.splice(pageIndex, 1);

			})

		},
	},

	compatibilityDate: '2024-10-05'
});
