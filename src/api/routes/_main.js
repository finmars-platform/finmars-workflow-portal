let host = useRuntimeConfig().public.apiURL
let prefix = host + '/{client}/workflow/api/v1'


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

	cancelWorkflow: {
		post: prefix + '/workflow/{id}/cancel/'
	},


	scheduleList: {
		get: prefix + '/schedule/'
	},
	schedule: {
		get: prefix + '/schedule/{id}/'
	},



	workflowTemplateList: {
		get: prefix + '/workflow-template/'
	},
	workflowTemplate: {
		get: prefix + '/workflow-template/{id}/',
		put: prefix + '/workflow-template/{id}/',
	},
};
