<template>
	<div>
		<div class="workflow-detail-page" v-if="workflow">
			<div class="workflow-graph-section">
				<div id="editor" class="editor"></div>
			</div>
			<div class="resizer" @mousedown="initResize"></div>
			<div class="workflow-detail-section">
				<h1>Workflow</h1>

				<div class="flex justify-start gap-2">
					<FmIconButton icon="mdi-refresh" @click="refresh" size="normal" >
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Refresh
						</FmTooltip>
					</FmIconButton>
					<FmIconButton
						v-if="workflow?.status !== 'progress'"
						size="normal"
						icon="mdi-replay"
						@click="openRelaunchDialog"
					>
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Relaunch
						</FmTooltip>
					</FmIconButton>
					<FmIconButton
						v-if="workflow?.status === 'progress' || workflow?.status === 'init'"
						size="normal"
						icon="mdi-close-circle"
						@click="openCancelWorkflow"
					>
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Cancel
						</FmTooltip>
					</FmIconButton>
					<FmIconButton
						v-if="activeTask"
						size="normal"
						icon="mdi-home-account"
						@click="activeTask = null"
					>
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Show Workflow
						</FmTooltip>
					</FmIconButton>
				</div>
				<div>
					<FmIconButton
						v-if="workflow?.status === 'progress'"
						size="normal"
						icon="mdi-pause-box"
						@click="pauseWorkflow"
					>
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Pause
						</FmTooltip>
					</FmIconButton>
					<FmIconButton
						v-if="workflow?.status === 'wait'"
						size="normal"
						icon="mdi-play-circle-outline"
						@click="openResumeDialog"
					>
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Resume
						</FmTooltip>
					</FmIconButton>
				</div>

				<div class="workflow-detail-content-section" v-if="!activeTask">

					<table>
						<tbody>
						<tr>
							<td>ID</td>
							<td>{{ workflow.id }}</td>
						</tr>
						<tr>
							<td>User Code</td>
							<td>{{ workflow.user_code }}</td>
						</tr>
						<tr>
							<td>Status</td>
							<td>
								<StatusBadge :status="workflow.status"/>
							</td>
						</tr>
						<tr>
							<td>Created At</td>
							<td :title="'Server Time: ' + workflow.created_at">{{
									$formatDate(workflow.created_at)
								}}
							</td>
						</tr>
						<tr>
							<td>Modified At</td>
							<td :title="'Server Time: ' + workflow.modified_at">{{
									$formatDate(workflow.modified_at)
								}}
							</td>
						</tr>
						<tr v-if="workflow.finished_at">
							<td>Finished At</td>
							<td :title="'Server Time: ' + workflow.finished_at">{{
									$formatDate(workflow.finished_at)
								}}
							</td>
						</tr>

						<tr v-if="workflow.finished_at">
							<td>Execution Time</td>
							<td>{{ formatExecutionTime(workflow.created_at, workflow.finished_at) }}</td>
						</tr>

						</tbody>
					</table>

					<h3>Payload</h3>
					<v-ace-editor
						v-model:value="workflowPayloadPretty"
						@init="editorInit"
						lang="json"
						theme="monokai"
						style="height: 300px;width: 100%;"/>

					<h3>Tasks</h3>
					<ul class="task-list">
						<div
							v-for="task in workflow.tasks"
							:key="task.id"
							@click="activeTask = task"
							class="task-item"
						>
							<div class="task-header">
								<span class="task-id">{{ task.id }} - {{ task.name }}</span>
								<StatusBadge :status="task.status"/>
							</div>

							<!-- Node Information -->
							<div v-if="linkedNode(task)" class="task-node-info">
								Linked Node: <strong>{{ linkedNode(task).data.node.user_code }}</strong>
							</div>
						</div>
					</ul>


				</div>

				<div v-if="activeTask" class="active-task-section">
					<h3>Active Task</h3>

					<div class="task-details">
						<div>ID: <strong>{{ activeTask.id }}</strong></div>
						<div>Name: <strong>{{ activeTask.name }}</strong></div>
						<div>Status:
							<StatusBadge :status="activeTask.status"/>
						</div>
						<div>Celery Task ID: <strong>{{ activeTask.celery_task_id }}</strong></div>
						<div>Worker: <strong>{{ activeTask.worker_name }}</strong></div>
						<div>
							<FmButton @click="seeWorkerLogs()" rounded>See Worker Logs</FmButton>
						</div>
						<div :title="'Server Time: ' + activeTask.created_at">Created At:
							<strong>{{ $formatDate(activeTask.created_at) }}</strong></div>
						<div :title="'Server Time: ' + activeTask.finished_at" v-if="activeTask.finished_at">Finished
							At: <strong>{{ $formatDate(activeTask.finished_at) }}</strong></div>
						<div v-if="activeTask.finished_at">Execution Time:
							<strong>{{ formatExecutionTime(activeTask.created_at, activeTask.finished_at) }}</strong>
						</div>
					</div>

					<div class="task-section">
						<h4>Log</h4>
						<pre class="log-container">{{ activeTask.log }}</pre>
					</div>

					<div class="task-section collapsible">
						<h4>Payload
							<FmIcon
								@click="payloadVisible = !payloadVisible"
								:icon="payloadVisible ? 'mdi-arrow-up' : 'mdi-arrow-down'"
								:size="32"
							/>
						</h4>
						<v-ace-editor
							v-if="payloadVisible"
							v-model:value="activeTask.payloadPretty"
							@init="editorInit"
							lang="json"
							theme="monokai"
							style="height: 300px;width: 100%;"
						/>
					</div>

					<div class="task-section collapsible">
						<h4>Result
							<FmIcon
								@click="resultVisible = !resultVisible"
								:icon="resultVisible ? 'mdi-arrow-up' : 'mdi-arrow-down'"
								:size="32"
							/>
						</h4>
						<v-ace-editor
							v-if="resultVisible"
							v-model:value="activeTask.resultPretty"
							@init="editorInit"
							lang="json"
							theme="monokai"
							style="height: 300px;width: 100%;"
						/>
					</div>

					<div class="task-actions">
						<FmButton @click="viewInFlower" rounded>View in Flower
							<template #prepend>
								<FmIcon color="" icon="mdi-square-rounded-badge-outline" :size="24" />
							</template>
						</FmButton>
					</div>
				</div>
			</div>
		</div>

		<div v-if="!workflow">
			Loading...
		</div>

		<BaseModal
			title="Relaunch Workflow"
			:isOpen="isRelaunchDialogOpen"
			@closeModal="isRelaunchDialogOpen = !isRelaunchDialogOpen"
			@okModal="relaunch"
		>
			<p style="margin: 1rem 0">Payload</p>
			<v-ace-editor
				v-model:value="relaunchPayload"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="height: 300px;width: 100%;"/>
		</BaseModal>

		<BaseModal
			title="Resume Workflow"
			:isOpen="isResumeDialogOpen"
			@closeModal="isResumeDialogOpen = !isResumeDialogOpen"
			@okModal="resumeWorkflow"
		>
			<p style="margin: 1rem 0">Payload</p>
			<v-ace-editor
				v-model:value="resumePayload"
				@init="editorInit"
				lang="json"
				theme="monokai"
				style="height: 300px;width: 100%;"/>
		</BaseModal>

		<FmConfirm
			title="Cancel Schedule"
			:isOpen="isShowCancelWorkflowConfirm"
			@closeModal="isShowCancelWorkflowConfirm = false"
			@okModal="cancelWorkflow"
		>
			<span>Are you sure you want to cancel {{workflow.name}} ?</span>
		</FmConfirm>
	</div>

</template>

<script setup>
import {FmButton, FmTooltip, FmIcon } from "@finmars/ui";

import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

import {ClassicPreset, NodeEditor} from "rete";
import {AreaExtensions, AreaPlugin} from 'rete-area-plugin';
import {Presets, VuePlugin} from 'rete-vue-plugin';

import WorkflowNode from "~/components/WorkflowNode.vue";
import StatusBadge from "~/components/StatusBadge.vue";
import BaseModal from "~/components/base/Modal.vue";
import FmConfirm from "~/components/fm/Confirm.vue";

const router = useRouter();
const route = useRoute();
const store = useStore()

const props = defineProps({
	workflow: Object,
});
const emit = defineEmits(['update'])

let isRelaunchDialogOpen = ref(false);
let isResumeDialogOpen = ref(false);
let relaunchPayload = ref('')
let resumePayload = ref('')

let workflowPayloadPretty = ref('')
let editor;
let editorArea;

const isShowCancelWorkflowConfirm = ref(false);
let activeTask = ref(null)
let resultVisible = ref(false)
let payloadVisible = ref(false)

watch(() => props.workflow, async () => {
	await getWorkflow()
})

async function getWorkflow() {
	workflowPayloadPretty.value = JSON.stringify(props.workflow.payload, null, 4)

	props.workflow.tasks.forEach((item) => {

		item.payloadPretty = JSON.stringify(item.payload, null, 4)
		item.resultPretty = JSON.stringify(item.result, null, 4)

	})

	await initGraph();
}

function editorInit(payloadEditor) {
	payloadEditor.setHighlightActiveLine(false);
	payloadEditor.setShowPrintMargin(false);
	payloadEditor.setFontSize(14)
	payloadEditor.setBehavioursEnabled(true);

	// payloadEditor.focus();
	payloadEditor.navigateFileStart();
}

async function initGraph() {

	await editor.clear();

	// Example: Create and add a node to the editor
	async function createNode(id, name, x, y) {
		const node = await new ClassicPreset.Node(name)
		node.position = [x, y];
		node.name = name;

		node.id = id;

		return node;
	}

	// Example: Create and add nodes

	const nodeMap = new Map();  // Map to hold node references by node_id
	const taskMap = new Map();  // Map to hold node references by node_id

	if (props.workflow.workflow_template_object) {

		const nodes = props.workflow.workflow_template_object.data.workflow.nodes;
		const tasks = props.workflow.tasks;


		// Iterate over nodes to render them in their defined positions
		for (const node of nodes) {

			await editor.addNode(node);

			await editorArea.translate(node.id, {x: node.position.x, y: node.position.y});

			nodeMap.set(node.id, node);

		}

		for (const task of tasks) {
			// Retrieve the node associated with this task by `node_id`
			const node = nodeMap.get(task.node_id);

			if (node) {
				// Attach relevant task information to the node, e.g., status, logs, etc.
				node.data = {
					...node.data,
					status: task.status,
					log: task.log,
					taskId: task.id,
					userCode: task.name,
					nodeId: task.node_id
				};

				taskMap.set(task.id, task);

				console.log(`Linked task to node:`, {taskId: task.id, nodeId: task.node_id});
			}
		}

		// Render connections after all nodes are created
		for (const connectionItem of props.workflow.workflow_template_object.data.workflow.connections) {

			const sourceNode = await editor.getNode(connectionItem.source);
			const targetNode = await editor.getNode(connectionItem.target);

			const connection = new ClassicPreset.Connection(sourceNode, connectionItem.sourceOutput, targetNode, connectionItem.targetInput)

			await editor.addConnection(
				connection
			);
		}

	} else {

		await props.workflow.tasks.forEach(async (item, index) => {

			const node = await createNode(item.name, 100, 100);

			await editor.addNode(node);

			await editorArea.translate(node.id, {x: 100 * index, y: 100});

		})

	}

	editorArea.addPipe(async context => {

		if (context.type === 'nodepicked') {

			const node = await editor.getNode(context.data.id);

			activeTask.value = taskMap.get(node.data.taskId)
			// node.position = context.data.position

			console.log('activeTask', activeTask.value)

		}
		return context
	})


	AreaExtensions.zoomAt(editorArea, editor.getNodes());

}


// Load workflow details on page load

async function refresh() {
	emit('update');
}

async function openRelaunchDialog() {

	isRelaunchDialogOpen.value = true;

	relaunchPayload.value = JSON.stringify(props.workflow.payload, null, 4)

}

async function relaunch() {

	const result = await useApi('runWorkflow.post', {
		body: JSON.stringify({
			user_code: props.workflow.user_code,
			payload: relaunchPayload.value ? JSON.parse(relaunchPayload.value) : {},
		})
	})

	isRelaunchDialogOpen.value = false;

	router.push(`/${store.realm_code}/${store.space_code}/w/workflow/${result.id}`)


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
			text: 'Failed to cancel the Workflow Template.'
		});
	} finally {
		isShowCancelWorkflowConfirm.value = false;
	}
}

async function pauseWorkflow() {

	const result = await useApi('pauseWorkflow.put', {
		params: {id: route.params.id},
		body: JSON.stringify({})
	})

	useNotify({
		type: 'success',
		title: 'Success',
		text: 'Workflow will be Paused after current Task is finished'
	})

	await refresh();

}

async function openResumeDialog() {

	isResumeDialogOpen.value = true;

	resumePayload.value = JSON.stringify(props.workflow.payload, null, 4)

}


async function resumeWorkflow() {
	const result = await useApi('resumeWorkflow.put', {
		params: {id: route.params.id},
		body: JSON.stringify({payload: JSON.parse(resumePayload.value)})
	})

	if (result._$error) {
		useNotify({
			type: 'error',
			title: 'Error',
			text: 'Cant Resume workflow'
		})
	} else {
		useNotify({
			type: 'success',
			title: 'Success',
			text: 'Workflow is resumed'
		})
	}

	isResumeDialogOpen.value = false;

	await refresh();

}

function viewInFlower() {

	const link = window.location.origin + `/${store.realm_code}/workflow/flower/task/${activeTask.value.celery_task_id}`
	window.open(link, '_blank')

}


async function setupGraph() {

	const container = document.getElementById('editor');

	// Initialize the Rete.js editor
	editor = new NodeEditor('demo@0.1.0', container);

	editorArea = new AreaPlugin(container);
	const render = new VuePlugin();

	const background = document.createElement("div");
	background.classList.add("pano-background");
	background.classList.add("pano-fill-area");
	editorArea.area.content.add(background);

	// Apply "classic" preset for default node appearance
	render.addPreset(Presets.classic.setup({
		customize: {
			node(context) {
				console.log(context.payload, WorkflowNode);
				// if (context.payload.label === "WorkflowNode") {
				// 	return WorkflowNode;
				// }
				// return Presets.classic.Node;
				return WorkflowNode;
			}
		}
	}));

	editor.use(editorArea);
	editorArea.use(render);
}

// Rete.js Setup
onMounted(async () => {

	await setupGraph();
	await getWorkflow()


});

function linkedNode(task) {
	// Assuming task.node_id links to a node in workflow template
	return props.workflow.workflow_template_object.data.workflow.nodes.find(node => node.id === task.node_id);
}

let initialX = 0;  // Track the initial mouse position

function initResize(event) {
	initialX = event.clientX;  // Record the initial position of the mouse

	// Attach the event listeners for resizing
	document.addEventListener('mousemove', resize);
	document.addEventListener('mouseup', stopResize);

	// Prevent default dragging behavior
	event.preventDefault();
}

function resize(event) {
	// Calculate the change in the mouse position
	const deltaX = event.clientX - initialX;

	// Calculate the new width for the left section
	const leftSection = document.querySelector('.workflow-graph-section');
	const rightSection = document.querySelector('.workflow-detail-section');

	// Get the current width of the left section in pixels
	const leftSectionWidth = leftSection.getBoundingClientRect().width;

	// Calculate the new width of the left section (adding deltaX)
	let newLeftWidth = leftSectionWidth + deltaX;

	// Ensure the new width is within reasonable bounds (e.g., between 10% and 90% of the total width)
	const totalWidth = leftSection.parentNode.getBoundingClientRect().width;
	if (newLeftWidth < totalWidth * 0.1) newLeftWidth = totalWidth * 0.1;
	if (newLeftWidth > totalWidth * 0.9) newLeftWidth = totalWidth * 0.9;

	// Set the new widths
	leftSection.style.flex = `0 0 ${newLeftWidth}px`;
	rightSection.style.flex = `0 0 ${totalWidth - newLeftWidth}px`;

	// Update initialX for the next movement
	initialX = event.clientX;
}

function stopResize() {
	document.removeEventListener('mousemove', resize);
	document.removeEventListener('mouseup', stopResize);
}

function formatExecutionTime(createdAt, finishedAt) {
	const created = new Date(createdAt);
	const finished = new Date(finishedAt);

	// Calculate the difference in milliseconds
	const diff = finished - created;

	// Convert to seconds and calculate mm:ss
	const totalSeconds = Math.floor(diff / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function seeWorkerLogs() {
	// https://eu-central-2.finmars.com/authorizer/api/v2/realm/3/log/?app_code=workflow&worker_name=worker00&start_time=2024-10-13

	const start_time = new Date(activeTask.value.created_at).toISOString().split('T')[0]

	// workflow-worker-worker00-realm0sqjq-6bff7c78ff-d8zzr
	const worker_name = activeTask.value.worker_name.split('-')[2]

	const link = window.location.origin + `/authorizer/api/v2/realm/${store.realm_code}/log/?app_code=workflow&worker_name=${worker_name}&start_time=${start_time}`
	window.open(link, '_blank')

}

</script>

<style lang="postcss" scoped>
.workflow-detail-page {
	display: flex;
	position: relative;
}

/* Left side for Rete.js Editor */
.workflow-detail-page {
	display: flex;
	height: 100vh;
	position: relative;
}

.workflow-graph-section {
	flex: 0 0 70%; /* Initial width for the left side */
	padding: 10px;
	transition: width 0.2s ease;
}

.resizer {
	width: 5px; /* Increase the width to make it easier to hover over */
	cursor: col-resize;
	position: relative;
	flex: 0 0 5px; /* Initial width for the right side */
}

#editor {
	width: 100%;
	height: 100%;
	border: 1px solid #ccc;
}

/* Right side for Workflow Details */
.workflow-detail-section {
	flex: 0 0 29%; /* Initial width for the right side */
	padding: 4px;
	border-left: 1px solid #ccc;
	overflow-y: auto;
	transition: width 0.2s ease;
	z-index: 0;
}

h2, h3 {
	margin-top: 0;
}

table {
	width: 100%;
	margin-bottom: 20px;
}

table td {
	padding: 8px;
}

ul {
	list-style-type: none;
	padding-left: 0;
}

li {
	margin-bottom: 10px;
}

.task-item {
	border: 1px solid #ddd;
	margin: 4px;
	cursor: pointer;
	padding: 4px 8px;
}

.active-task-section {
	margin: 4px;
	margin-top: 16px;
	margin-left: 8px;
	padding: 4px 8px;
	border: 1px solid #ddd;
}


.log-container {
	padding: 4px;
	background: #000;
	color: #fff;
	white-space: pretty;
	max-height: 400px;
	overflow: auto;
}

.workflow-detail-section {
	flex: 0 0 29%; /* Adjusted width */
	padding: 4px; /* Increased padding for a cleaner layout */
	border-left: 1px solid #ddd; /* Separate left and right sections visually */
	overflow-y: auto;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add slight shadow for depth */
}

.workflow-detail-section h1 {
	font-size: 1.8rem;
	font-weight: bold;
	margin-bottom: 20px;
	color: var(--primary-color); /* Assuming there's a defined primary color */
}

.action-buttons,
.pause-resume-buttons {
	display: flex;
	gap: 10px;
	margin-bottom: 20px; /* Ensure buttons are separated from other content */
}

.action-buttons fm-btn,
.pause-resume-buttons fm-btn {
	padding: 10px 15px;
	color: white;
	border-radius: 5px;
	transition: background-color 0.3s;
}

.workflow-detail-content-section table {
	width: 100%;
	margin-bottom: 20px;
	border-collapse: collapse; /* Clean table borders */
}

.workflow-detail-content-section table td {
	padding: 10px; /* Increased padding for better readability */
	border-bottom: 1px solid #ddd;
	text-align: left;
}

.workflow-detail-content-section table th {
	font-weight: bold;
}

.workflow-detail-content-section h3 {
	font-size: 1.5rem;
	font-weight: bold;
	margin-top: 20px;
	color: var(--primary-color); /* Consistent heading color */
}

.task-list {
	margin-top: 10px;
}

.task-item {
	padding: 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.2s;
}

.active-task-section {
	margin-top: 20px;
	padding: 15px;
	border: 1px solid #ddd;
	border-radius: 4px;
}

.log-container {
	color: #fff;
	padding: 10px;
	overflow-y: auto;
	max-height: 200px;
	border-radius: 4px;
	font-family: monospace; /* For log readability */
}

.task-list {
	list-style: none;
	padding: 0;
	margin: 16px 0;
}

.task-item {
	border: 1px solid #ddd;
	border-radius: 8px;
	padding: 12px;
	margin-bottom: 12px;
	cursor: pointer;
	transition: all 0.3s ease;
}

.task-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.task-id {
	font-size: 16px;
	font-weight: bold;
	color: #333;
}

.task-node-info {
	font-size: 14px;
	color: #555;
}

.active-task-section {
	border: 1px solid #ddd;
	border-radius: 8px;
	padding: 16px;
	margin-top: 16px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-details {
	display: flex;
	flex-direction: column;
	margin-bottom: 16px;
}

.task-details div {
	margin-bottom: 8px;
	font-size: 14px;
	color: #333;
}

.task-details strong {
	font-weight: bold;
	color: #000;
}

.task-section {
	margin-bottom: 16px;
}

.task-section h4 {
	font-size: 16px;
	margin-bottom: 8px;
	display: flex;
	align-items: center;
	cursor: pointer;
}

.log-container {
	border: 1px solid #ccc;
	border-radius: 4px;
	padding: 8px;
	font-size: 12px;
	color: #333;
	white-space: pre-wrap;
	max-height: 200px;
	overflow-y: auto;
}

.collapsible {
	padding: 12px;
	border: 1px solid #ddd;
	border-radius: 8px;
}

.task-actions {
	margin-top: 16px;
	display: flex;
	justify-content: flex-start;
}

.task-actions fm-btn {
	margin-right: 8px;
}
</style>
