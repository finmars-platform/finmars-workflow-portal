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
			workflowItem: {},
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
			await this.getUser()

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

			await Promise.all([]);

		},

		async getTheme(user) {
			if (!user.data.theme) {
				// if no theme selected, use default one
				return;
			}

			// User selected specific theme

			const themePath = user.data.theme.split('.').join('/');
			const itemPath = `.system/ui/themes/${themePath}/theme.css`;

			try {
				const blob = await useApi('explorerViewFile.get', {
					filters: { path: itemPath },
					notifyError: false
				});

				// seems useApi somehow Parse blob already
				var styleElement = document.createElement('style');
				styleElement.textContent = blob;

				document.head.appendChild(styleElement);

				// const reader = new FileReader();
				//
				// reader.addEventListener("loadend", function (e) {
				//
				// 	var styleElement = document.createElement('style');
				// 	styleElement.textContent = reader.result;
				//
				// 	document.head.appendChild(styleElement);
				//
				// });
				//
				// reader.readAsText(blob);
			} catch (error) {
				console.error(
					'[portalController loadTheme] Could not fetch theme',
					error
				);
			}
		},

		async getUser() {
			let res = await useApi('me.get')

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

			document.body.classList.toggle('dark-mode', this.user.data.dark_mode);

			if (this.user.data.dark_mode) {
				document.body.classList.add('dark-theme');
				document.body.classList.remove('light-theme');
			} else {
				document.body.classList.add('light-theme');
				document.body.classList.remove('dark-theme');
			}

			await this.getTheme(this.user);

		},

		setWorkflowItem(item) {
			this.workflowItem = item;
		},

		clearWorkflowItem() {
			this.workflowItem = {};
		}
	},
	getters: {
		darkModeActive(state) {
			return state.user.data?.dark_mode
		},
	},
})
