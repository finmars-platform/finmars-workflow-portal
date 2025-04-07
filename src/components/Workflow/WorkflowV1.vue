<template>
	<div class="workflow-detail-page">
		<div class="workflow-graph-section">No data</div>
		<div class="workflow-detail-section">
			<h2 class="mb-2">Workflow Template Details</h2>

			<div class="button-group">
				<FmIconButton icon="mdi-refresh" @click.stop.prevent="refresh" size="normal" >
					<FmTooltip activator="parent" type="secondary" location="bottom">
						Refresh
					</FmTooltip>
				</FmIconButton>
				<FmIconButton icon="mdi-play-circle" @click.stop.prevent="openConfirmRelaunch" size="normal" >
					<FmTooltip activator="parent" type="secondary" location="bottom">
						Relaunch
					</FmTooltip>
				</FmIconButton>
				<FmIconButton icon="mdi-close-circle" @click.stop.prevent="openCancelWorkflow" size="normal" >
					<FmTooltip activator="parent" type="secondary" location="bottom">
						Terminate
					</FmTooltip>
				</FmIconButton>
				<FmIconButton icon="mdi-format-list-bulleted" @click="payloadDialog = true" size="normal" >
					<FmTooltip activator="parent" type="secondary" location="bottom">
						Payload
					</FmTooltip>
				</FmIconButton>
				<FmIconButton icon="mdi-paper-roll-outline" @click="goToWorkerLogs" size="normal" >
					<FmTooltip activator="parent" type="secondary" location="bottom">
						Worker {{selectedTask?.worker_name}} Logs
					</FmTooltip>
				</FmIconButton>
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
					<code>{{ selectedTask.log }}</code>
				</div>

				<div v-if="selectedTask.progress">
					<h2 class="text-center" style="margin-bottom: 8px">Progress</h2>
					<code>{{ selectedTask.progress }}</code>
				</div>

				<div class="row mt-4" v-if="!selectedTask.result">
					<div class="col">
						<div class="notice">
							<FmIcon icon="mdi-information-slab-circle-outline" :size="32" />
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
									<FmIcon icon="mdi-information-slab-circle-outline" :size="32" />
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
				<FmButton @click="getFlowerTaskUrl" rounded>View in Flower
					<template #prepend>
						<FmIcon color="" icon="mdi-square-rounded-badge-outline" :size="24" />
					</template>
				</FmButton>
			</div>

			<BaseModal
				:title="'Workflow\'s Payload'"
				:isOpen="payloadDialog"
				width="30vw"
				height="30%"
				minHeight="400px"
				@closeModal="payloadDialog = false"
				@okModal="payloadDialog = false"
			>
				<pre>{{workflow.payload}}</pre>
			</BaseModal>

			<FmConfirm
				title="Terminate Schedule"
				:isOpen="isShowCancelWorkflowConfirm"
				@closeModal="isShowCancelWorkflowConfirm = false"
				@okModal="cancelWorkflow"
			>
				<span>Are you sure you want to terminate {{workflow.name}} ?</span>
			</FmConfirm>

			<FmConfirm
				title="Relunch Workflow"
				:isOpen="isShowRelunchConfirm"
				@closeModal="isShowRelunchConfirm = false"
				@okModal="confirmRelaunch"
			>
				<span>Are you sure you want to relunch {{workflow.name}} ?</span>
			</FmConfirm>

		</div>
	</div>
</template>
<script setup>
import {FmButton, FmTooltip, FmIcon } from "@finmars/ui";
import BaseModal from '../base/Modal.vue'
import FmConfirm from "~/components/fm/Confirm.vue";

const route = useRoute();
const store = useStore();

const props = defineProps({
	workflow: Object,
});
const emit = defineEmits(['update'])

const selectedTask = ref(props.workflow.tasks?.[0]);

const isShowCancelWorkflowConfirm = ref(false);
const isShowRelunchConfirm = ref(false);
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
	window.open(`/${store.realm_code}/workflow/flower/task/` + selectedTask.value.celery_task_id, '_blank');
}

function openCancelWorkflow() {
	isShowCancelWorkflowConfirm.value = true;
}

async function cancelWorkflow() {
	try {
		const res = await useApi('cancelWorkflow.post', {
			params: {id: route.params.id},
			body: JSON.stringify({})
		});
		if (res && res._$error) {
			useNotify({
				type: 'error',
				title: res._$error.message || res._$error.error.details
			});
		} else {
			useNotify({
				type: 'success',
				text: 'Workflow Template terminated successfully!'
			});
			await refresh();
		}
	} catch (e) {
		useNotify({
			type: 'error',
			title: 'Error',
			text: 'Failed to terminate the Workflow Template.'
		});
	} finally {
		isShowCancelWorkflowConfirm.value = false;
	}
}

async function refresh() {
	emit('update');
}

function openConfirmRelaunch() {
	isShowRelunchConfirm.value = true;
}
async function confirmRelaunch() {
	try {
		const res = await useApi('relaunchWorkflow.post', {
			params: {id: route.params.id},
			body: JSON.stringify({})
		});
		if (res && res._$error) {
			useNotify({
				type: 'error',
				title: res._$error.message || res._$error.error.details
			});
		} else {
			useNotify({
				type: 'success',
				text: 'Workflow Template terminated successfully!'
			});
			await refresh();
		}
	} catch (e) {
		useNotify({
			type: 'error',
			title: 'Error',
			text: 'Failed to relunch the Workflow Template.'
		});
	} finally {
		isShowRelunchConfirm.value = false;
	}
}

function formatDate(dateString) {
	const options = {year: 'numeric', month: 'short', day: 'numeric'};
	return new Date(dateString).toLocaleDateString(undefined, options);
}
</script>

<style scoped>
.workflow-detail-page {
	display: flex;
}

/* Left side for Rete.js Editor */
.workflow-graph-section {
	flex: 0.3;
	padding: 15px;
}

/* Right side for Workflow Details */
.workflow-detail-section {
	flex: 0.7;
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

table{
	width: 100%;
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
	max-height: 400px;
	max-width: 66vw;
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
	margin-bottom: 16px;
}

.notice {
	display: flex;
	gap: 16px;
	padding: 16px;
	caret-color: #000000;
	border: thin solid #000000;
	border-radius: 4px;
	margin-bottom: 16px;
}
</style>
