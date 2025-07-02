let host = useRuntimeConfig().public.apiURL
let prefix = host + '/{client}/workflow/api/v1'


// SZ
// only for local development, when finmars-core and finmars-workflow hosted on different ports, same machine
function resolveHost() {

	console.log('host', host);
	if (host === 'http://0.0.0.0:8001') {
		return 'http://0.0.0.0:8000';
	}
	return host

}


export default {
	definitionList: {
		get: prefix + '/definition/'
	},


	workflowList: {
		get: prefix + '/workflow/'
	},
	workflowListLight: {
		get: prefix + '/workflow/light/'
	},
	workflow: {
		get: prefix + '/workflow/{id}/'
	},

	runWorkflow: {
		post: prefix + '/workflow/run-workflow/'
	},

	pauseWorkflow: {
		put: prefix + '/workflow/{id}/pause/'
	},
	resumeWorkflow: {
		put: prefix + '/workflow/{id}/resume/'
	},

	cancelWorkflow: {
		post: prefix + '/workflow/{id}/cancel/'
	},

	relaunchWorkflow: {
		post: prefix + '/workflow/{id}/relaunch/'
	},

	refreshStorage: {
		get: prefix + '/refresh-storage/'
	},


	scheduleList: {
		get: prefix + '/schedule/'
	},
	schedule: {
		get: prefix + '/schedule/{id}/',
		post: prefix + '/schedule/',
		put: prefix + '/schedule/{id}/',
		patch: prefix + '/schedule/{id}/',
		delete: prefix + '/schedule/{id}/',
	},

	scheduleRunManual: {
		put: prefix + '/schedule/{id}/run-manual/',
	},

	workflowTemplateList: {
		get: prefix + '/workflow-template/'
	},
	workflowTemplate: {
		get: prefix + '/workflow-template/{id}/',
		put: prefix + '/workflow-template/{id}/',
		delete: prefix + '/workflow-template/{id}/',
		post: prefix + '/workflow-template/',
	},

	memberList: {
		get: resolveHost() + '/{client}/api/v1/users/member/'
	},
	member: {
		get: resolveHost() + '/{client}/api/v1/users/member/{id}/',
		post: resolveHost() + '/{client}/api/v1/users/member/',
		delete: resolveHost() + '/{client}/api/v1/users/member/{id}/',
		put: resolveHost() + '/{client}/api/v1/users/member/{id}/'
	},

	memberLayout: {
		get: resolveHost() + '/{client}/api/v1/ui/member-layout/',
		put: resolveHost() + '/{client}/api/v1/ui/member-layout/{id}/'
	},

	systemMessages: {
		get: resolveHost() + '/{client}/api/v1/system-messages/message/'
	},
};
