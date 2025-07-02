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

		async getMe() {
			const memberProm = useApi('member.get', { params: { id: 0 } });
			const memberLayoutProm = useApi('memberLayout.get', {
				filters: { is_default: true }
			});

			const res = await Promise.all([memberProm, memberLayoutProm]);

			if (res[0]._$error || res[1]._$error) {
				console.error(
					'Error while fetching data of member:',
					res[0]._$error || res[1]._$error
				);
			} else {
				let member = res[0];

				if (!member.data) {
					member.data = {};
				}

				let memberLayout = res[1].results[0];

				if (!memberLayout.data) {
					memberLayout.data = {};
				}

				if (typeof memberLayout.data.autosave_layouts !== 'boolean') {
					memberLayout.data.autosave_layouts = true;
				}

				if (!memberLayout.data.favorites) {
					memberLayout.data.favorites = {};
				}

				if (!memberLayout.data.favorites.transaction_type) {
					memberLayout.data.favorites.transaction_type = [];
				}

				if (!memberLayout.data.favorites.attributes) {
					memberLayout.data.favorites.attributes = {};
				}

				/*if (!res.data.favorites) {
					res.data.favorites = {}
				}

				if (!res.data.favorites.transaction_type) {
					res.data.favorites.transaction_type = []
				}

				if (!res.data.favorites.attributes) {
					res.data.favorites.attributes = {}
				}*/

				this.member = member;
				this.memberLayout = memberLayout;
			}
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

			document.body.classList.toggle('dark', this.user.data.dark_mode);

			if (this.user.data.dark_mode) {
				document.body.classList.add('dark-theme');
				document.body.classList.remove('light-theme');
			} else {
				document.body.classList.add('light-theme');
				document.body.classList.remove('dark-theme');
			}

		},
	},
	getters: {
		darkModeActive(state) {
			// return state.user.data?.dark_mode
			return JSON.parse(localStorage.getItem("isDarkMode")) || false;
		},
		isUrlValid(state) {
			return state.realm_code && state.space_code;
		},
	},
})
