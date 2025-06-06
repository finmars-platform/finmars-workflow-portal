import {defineStore} from 'pinia';

export default defineStore({
	id: 'global',
	state: () => {
		return {
			user: {},
			masterUsers: [],
			realms: [],
			member: {},
			systemErrors: [],
		}
	},
	actions: {
		registerSysError(error) {
			this.systemErrors.push({
				created: new Date().toISOString(),
				location: window.location.href,
				text: JSON.stringify(error),
			})
		},
		async init() {


			const pathname = window.location.pathname;

			if (pathname.includes('/space')) {

				const pathnamePartsList = pathname.split('/');
				const realm_code = pathnamePartsList.find(part => part.startsWith('realm'));
				const space_code = pathnamePartsList.find(part => part.startsWith('space'));

				this.realm_code = realm_code
				this.space_code = space_code

			} else {
				console.warn("useStore.init: no space_code in the pathname" + pathname);
				// Throw error when we move profile to separate repository
				// throw new Error("useStore.init: no space_code in the pathname" + pathname);
			}

			await this.getUser()

			await Promise.all([]);

		},

		async getUser() {
			let res;

			let config = useRuntimeConfig().public;

			console.log('config', config);

			if (config.EDITION_TYPE == 'enterprise') {
				res = await useApi('me.get');
			} else if (config.EDITION_TYPE == 'community') {
				const memberProm = await useApi('member.get', { params: { id: 0 } });
				res = memberProm.user
			}

			if (res._$error) {
				throw res._$error;
			}

			this.user = res

			if (window._paq) {
				// Consider more unique id across spaces

				let prefix = 'eu-central'

				if (window.location.href.indexOf('0.0.0.0') !== -1) {
					prefix = 'local'
				}

				let pieces = window.location.host.split('.')

				if (pieces.length === 3) {
					prefix = pieces[0]
				}

				window._paq.push(['setUserId', prefix + '_' + this.user.id]);
			}

			if (!this.user.data) this.user.data = {}

			if (typeof this.user.data.autosave_layouts !== 'boolean') {
				this.user.data.autosave_layouts = true
			}

			document.body.classList.toggle('dark', JSON.parse(localStorage.getItem("isDarkMode")) || false);

		},
	},
	getters: {
		darkModeActive(state) {
			// return state.user.data?.dark_mode
			return JSON.parse(localStorage.getItem("isDarkMode")) || false;
		},
	},
})
