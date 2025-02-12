<template>
	<div class="workflow-detail-page">
		<!-- Left side: Rete.js Workflow Graph -->
		<div class="workflow-graph-section">No data</div>

		<!-- Right side: Workflow Details -->
		<div class="workflow-detail-section">
			<h2>Workflow Template Details</h2>

			<div class="button-group">
				<fm-btn @click="refresh">
					<fm-icon icon="refresh" title="Refresh"/>
				</fm-btn>
				<fm-btn @click="confirmRelaunch">
					<fm-icon icon="play_circle" title="Relaunch"/>
				</fm-btn>
				<fm-btn @click="cancelWorkflow">
					<fm-icon icon="cancel" title="Terminate"/>
				</fm-btn>
				<fm-btn @click="payloadDialog = true">
					<fm-icon icon="format_list_bulleted" title="Payload"/>
				</fm-btn>
				<fm-btn @click="goToWorkerLogs">
					<fm-icon icon="receipt_long" :title="`Worker ${selectedTask?.worker_name} Logs`"/>
				</fm-btn>
				<fm-btn @click.stop="refreshStorage()" class="btn-depressed">
					<fm-icon icon="cloud_sync" title="Refresh Storage"/>
				</fm-btn>
			</div>

			<div v-if="workflow" class="workflow">
				<div class="overline mb-3">
					{{ formatDate(workflow.created_at) }}
				</div>
				<div>
					<div class="headline">
						{{ workflow.fullname }}
						<div v-if="workflow.periodic">periodic</div>
						<div class="chip" :style="{ backgroundColor: getColor(selectedTask.status) }">
							{{ workflow.status }}
						</div>
					</div>
					<div>
						<u>Tasks :</u> Total <strong>{{ workflow.tasks.length }}</strong> / Success
						<strong>{{ workflow.tasks | countTasksByStatus('success') }}</strong>
						/ Error
						<strong>{{ workflow.tasks | countTasksByStatus('error') }}</strong>
					</div>
				</div>
			</div>
			<div v-if="selectedTask" class="pa-4">
				<h2 class="text-center" style="margin-bottom: 8px">Task</h2>

				<div class="v-data-table">
					<div class="v-data-table__wrapper">
						<table>
							<tbody>
							<tr>
								<td><strong>ID</strong></td>
								<td>{{ selectedTask.id }}</td>
							</tr>
							<tr>
								<td><strong>Key</strong></td>
								<td>{{ selectedTask.name }}</td>
							</tr>
							<tr>
								<td><strong>Task Status</strong></td>
								<td>
									<div class="chip" :style="{ backgroundColor: getColor(selectedTask.status) }">
										{{ selectedTask.status }}
									</div>
								</td>
							</tr>
							<tr>
								<td><strong>Created</strong></td>
								<td>{{ selectedTask.created | formatDate }}</td>
							</tr>
							<tr>
								<td><strong>Updated</strong></td>
								<td>{{ selectedTask.updated | formatDate }}</td>
							</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div v-if="selectedTask.log">
					<h2 class="text-center" style="margin-bottom: 8px">Log</h2>
					<code style="max-height: 300px">{{ selectedTask.log }}</code>
				</div>

				<div v-if="selectedTask.progress">
					<h2 class="text-center" style="margin-bottom: 8px">Progress</h2>
					<code>{{ selectedTask.progress }}</code>
				</div>

				<div class="row mt-4" v-if="!selectedTask.result">
					<div class="col">
						<div class="notice">
							<fm-icon icon="info"/>
							No task result
						</div>
					</div>
				</div>

				<div v-else>
					<h2 class="text-center" style="margin-bottom: 8px">Result</h2>
					<code v-if="selectedTask.result && selectedTask.status !== 'error'">{{
							selectedTask.result
						}}</code>
					<div v-if="selectedTask.result && selectedTask.status === 'error'">
						<div class="row">
							<div class="col">
								<div class="alert">
									<fm-icon icon="info"/>

									{{ selectedTask.result.exception }}
								</div>
							</div>
						</div>
						<code>{{ selectedTask.result.traceback }}</code>
					</div>
				</div>
			</div>
			<div
				class="footer"
				v-if="
          selectedTask && (workflow.status === 'success' || selectedTask.is_hook === false)
        "
			>
				<a target="_blank" :href="getFlowerTaskUrl()" class="pa-6">
					<fm-btn>
						<fm-icon icon="launch"/>
						View in Flower
					</fm-btn>
				</a>
			</div>

			<fm-base-modal v-model="payloadDialog" title="Workflow's Payload" width="500">
				<div>
					<pre>{{ workflow.payload }}</pre>
				</div>
				<template #footer>
					<div class="flex flex-row justify-between">
						<fm-btn type="text" @click="payloadDialog = false">Cancel</fm-btn>
					</div>
				</template>
			</fm-base-modal>
		</div>
	</div>
</template>
<script setup>
import {onMounted} from 'vue';

const route = useRoute();
const store = useStore();

const props = defineProps({
	workflow: Object,
});
const emit = defineEmits(['update'])

const selectedTask = ref(props.workflow.tasks?.[0]);

const payloadDialog = ref(false);

function getColor(status) {
	return {
		success: 'green',
		error: 'red',
		canceled: '#B71C1C',
		warning: 'orange',
		progress: 'blue',
		init: 'grey'
	}[status];
}

function countTasksByStatus(status) {
	return props.workflow.tasks?.filter((task) => task.status === status)?.length;
}

function getFlowerTaskUrl() {
	return (
		window.location.origin +
		`/${store.realm_code}/workflow/flower/task/` +
		selectedTask.value.celery_task_id
	);
}

async function refreshStorage() {
	await useApi('refreshStorage.get');

	await refresh();

	useNotify({
		type: 'success',
		title: 'Success',
		text: 'Storage refreshed'
	});
}

async function cancelWorkflow() {
	let isConfirm = await useConfirm({
		title: 'Cancel the workflow',
		text: `Are you sure you want to cancel Workflow?`
	});
	if (!isConfirm) return false;

	await useApi('cancelWorkflow.post', {
		params: {id: route.params.id},
		body: JSON.stringify({})
	});

	await refresh();
}

async function refresh() {
	emit('update');
}

async function confirmRelaunch() {
	const isConfirm = await useConfirm({
		title: 'Relaunch the workflow',
		text: `The workflow will be relaunched with the same payload. Note that a new workflow will be created, so the current one (created on ) will not be changed and will still be available in your history.`
	});

	if (!isConfirm) return false;

	await useApi('relaunchWorkflow.post', {
		params: {id: route.params.id},
		body: JSON.stringify({})
	});

	await refresh();
}

function formatDate(dateString) {
	const options = {year: 'numeric', month: 'short', day: 'numeric'};
	return new Date(dateString).toLocaleDateString(undefined, options);
}
</script>

<style scoped>
.workflow-detail-page {
	display: flex;
	height: 100vh;
}

/* Left side for Rete.js Editor */
.workflow-graph-section {
	flex: 0.3;
	background-color: #f5f5f5;
	padding: 15px;
}

/* Right side for Workflow Details */
.workflow-detail-section {
	flex: 0.7;
	background-color: #fff;
	padding: 20px;
	border-left: 1px solid #ccc;
	overflow-y: auto;
	z-index: 0;
}

h2 {
	margin-top: 0;
	font-size: 1.5rem;
}

h3 {
	margin-top: 1rem;
	font-size: 1.2rem;
}

/* Button Group Styles */
.button-group {
	display: flex;
	justify-content: space-between;
	margin-bottom: 15px;
}

.chip {
	align-items: center;
	cursor: default;
	display: inline-flex;
	line-height: 20px;
	max-width: 100%;
	outline: none;
	overflow: hidden;
	padding: 0 12px;
	position: relative;
	text-decoration: none;
	transition-duration: 0.28s;
	transition-property: box-shadow, opacity;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	vertical-align: middle;
	white-space: nowrap;
	color: white;
	border-radius: 12px;
}

code {
	max-height: 300px;
	white-space: pre;
	overflow-x: auto;
	display: block !important;
	box-shadow: none;
	font-weight: normal;
	font-size: 90%;
	background-color: #fbe5e1;
	color: #c0341d;
	padding: 10px;
	border-radius: 3px;
}

td {
	font-size: 0.875rem;
	height: 48px;
	padding: 0 16px;
	border: 1px solid rgb(255, 219, 208);
	color: rgb(35, 25, 23);
}

.footer {
	display: flex;
	padding: 16px 0;
	justify-content: center;
}

.headline {
	margin-bottom: 8px;
}

.alert {
	display: flex;
	gap: 16px;
	padding: 16px;
	color: #E53935;
	caret-color: #E53935;

	border: thin solid #E53935;
	border-radius: 4px;
	background-color: rgba(229, 57, 53, 0.12);

	margin-bottom: 16px;
}

.notice {
	display: flex;
	gap: 16px;
	padding: 16px;
	color: #000000;
	caret-color: #000000;

	border: thin solid #000000;
	border-radius: 4px;
	background-color: rgba(000, 000, 000, 0.12);

	margin-bottom: 16px;
}
</style>
