<template>

	<div class="workflow-detail-page">

		<!-- Left side: Rete.js Workflow Graph -->
		<div class="workflow-graph-section">
			<div id="editor" class="editor"></div>
		</div>

		<!-- Right side: Workflow Details -->
		<div class="workflow-detail-section">
			<h2>Workflow Template Details</h2>

			<div style="display: flex">

				<fm-btn @click="refresh()">
					Refresh
				</fm-btn>
				<fm-btn @click="openLaunchDialog()">
					Launch
				</fm-btn>

				<fm-btn @click="save()">
					Save
				</fm-btn>
			</div>

			<table>
				<tbody>
				<tr>
					<td>ID</td>
					<td>{{ workflow.id }}</td>
				</tr>
				<tr>
					<td>Name</td>
					<td>{{ workflow.name }}</td>
				</tr>
				<tr>
					<td>User Code</td>
					<td>{{ workflow.user_code }}</td>
				</tr>
				<tr>
					<td>Created</td>
					<td>{{ $formatDate(workflow.created) }}</td>
				</tr>
				<tr>
					<td>Modified</td>
					<td>{{ $formatDate(workflow.modified) }}</td>
				</tr>
				</tbody>
			</table>

			<div style="margin: 10px 0">

				<p style="margin-top: 1rem">Default Payload</p>
				<v-ace-editor
					v-model:value="defaultPayload"
					@init="payloadEditorInit"
					lang="json"
					theme="monokai"
					style="height: 300px;width: 100%;"/>

			</div>

			<div class="workflow-template-designer-section">
				<h2>Workflow Designer</h2>


				<div>
					<label for="workflow-select">Add Workflow Block</label>
					<select v-model="selectedWorkflow" id="workflow-select" style="border: 1px solid #ddd; width: 100%;">
						<option v-for="workflow in availableWorkflows" :key="workflow.user_code" :value="workflow">
							{{ workflow.user_code }}
						</option>
					</select>
					<fm-btn @click="addBlock()">Add Block</fm-btn>
				</div>

				<!-- Display existing blocks (from editor) -->
				<ul>
					<div v-for="block in blocks" :key="block.id"
						 style="display: flex; align-items: center; border: 1px solid #ddd; margin: 4px; padding: 4px 8px; justify-content: space-between">
						{{ block.name }}
						<fm-btn @click="removeBlock(block.id)">Remove</fm-btn>
					</div>
				</ul>

			</div>


		</div>
	</div>

	<fm-base-modal
		title="Launch Workflow"
		v-model="isLaunchDialogOpen"
	>

		<p>
			Note that a new workflow will be created, so the current one will not be changed and will still be available
			in your history.
		</p>


		<p style="margin-top: 1rem">Payload</p>
		<v-ace-editor
			v-model:value="launchPayload"
			@init="payloadEditorInit"
			lang="json"
			theme="monokai"
			style="height: 300px;width: 100%;"/>

		<template #footer>
			<div class="flex flex-row justify-between">
				<fm-btn type="text" @click="isLaunchDialogOpen = !isLaunchDialogOpen">Cancel</fm-btn>

				<fm-btn type="filled" @click="relaunch($event)">Launch</fm-btn>
			</div>
		</template>
	</fm-base-modal>

</template>

<script setup>


import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

import {onMounted, ref} from 'vue';
import {ClassicPreset, NodeEditor} from "rete";
import {AreaExtensions, AreaPlugin} from 'rete-area-plugin';
import {ConnectionPlugin, Presets as ConnectionPresets} from "rete-connection-plugin"
import {Presets, VuePlugin} from 'rete-vue-plugin';

import WorkflowNode from "~/components/WorkflowNode.vue";

const router = useRouter();
const route = useRoute();
const store = useStore()

definePageMeta({
	middleware: "auth",
});

let isLaunchDialogOpen = ref(false);
let launchPayload = ref('')
let defaultPayload = ref('')

const selectedWorkflow = ref(null);
let availableWorkflows = ref([]);

async function getWorkflows() {
	availableWorkflows.value = await useApi('definitionList.get')

	console.log('availableWorkflows', availableWorkflows)
}

let workflow = ref({});
let editor;
let editorArea;

const blocks = ref([]);

async function addBlock() {
	if (!selectedWorkflow.value) return;
	const {name, user_code} = selectedWorkflow.value;
	const node = await createNode(name, user_code, 100, 100);
	await editor.addNode(node);
	blocks.value.push({id: node.id, name, user_code});
}

async function createNode(name, user_code, x, y) {
	const node = await new ClassicPreset.Node(name);
	node.position = [x, y];
	node.name = name;
	node.data = {user_code}; // store the user_code in node data
	// node.addOutput(new ClassicPreset.Output('out', 'Output', new ClassicPreset.Socket("socket")));

	const outputSocket = new ClassicPreset.Socket("socket");
	node.addOutput('out', new ClassicPreset.Input(outputSocket));

	const inputSocket = new ClassicPreset.Socket("socket");
	node.addInput('in', new ClassicPreset.Input(inputSocket));
	return node;
}

async function removeBlock(id) {
	const node = await editor.getNode(id);
	console.log('removeBlock.node', node);

	const connections = await editor.getConnections()
	console.log('connections', connections);

	for (const connection of connections) {

		if (node.id === connection.source || node.id === connection.target) {
			await editor.removeConnection(connection.id);
		}

	}

	await editor.removeNode(node.id);
	blocks.value = blocks.value.filter(block => block.id !== id);
}


async function getWorkflow() {

	workflow.value = await useApi('workflowTemplate.get', {params: {id: route.params.id}});

	defaultPayload.value = JSON.stringify(workflow.value.data.workflow.default_payload, null, 4) || ""

	await initGraph();
}

async function init() {

	await getWorkflow()

}

function payloadEditorInit(payloadEditor) {
	payloadEditor.setHighlightActiveLine(false);
	payloadEditor.setShowPrintMargin(false);
	payloadEditor.setFontSize(14)
	payloadEditor.setBehavioursEnabled(true);

	payloadEditor.focus();
	payloadEditor.navigateFileStart();
}

async function initGraph() {

	await editor.clear();

	if (workflow.value.data) {

		const nodeMap = {};

		blocks.value = []



		for (const node of workflow.value.data.workflow.nodes) {

			console.log('node', node);

			blocks.value.push({id: node.id, name: node.name, user_code: node.data.user_code});

			await editor.addNode(node);

			await editorArea.translate(node.id, {x: node.position.x, y: node.position.y});

			nodeMap[node.id] = node;
		}

		console.log('nodeMap', nodeMap);


		for (const connectionItem of workflow.value.data.workflow.connections) {

			const sourceNode = await editor.getNode(connectionItem.source);
			const targetNode = await editor.getNode(connectionItem.target);

			console.log('sourceNode', sourceNode);

			const connection = new ClassicPreset.Connection(sourceNode, connectionItem.sourceOutput, targetNode, connectionItem.targetInput)

			await editor.addConnection(
				connection
			);
		}

	}

	// editorArea.on('nodetranslated', (node, position) => {
	// 	console.log(`Node ${node.name} was moved to`, position);
	// 	node.position = position; // Update the node's position in the editor model
	// });

	// editor.addPipe(context => {
	//
	// 	console.log('context', context)
	// 	// if (context.type === 'nodecreate') return
	// 	return context
	// })

	editorArea.addPipe(async context => {


		if (context.type === 'nodetranslated') {

			const node = await editor.getNode(context.data.id);
			node.position = context.data.position

			// console.log('editorArea.context', context)
			// console.log('editorArea.node', node)

		}
		return context
	})

	AreaExtensions.zoomAt(editorArea, editor.getNodes());


}


// Load workflow details on page load

async function refresh() {
	await init();
}

async function openLaunchDialog() {

	isLaunchDialogOpen.value = true;

	launchPayload.value = defaultPayload.value

}

async function relaunch() {

	const result = await useApi('runWorkflow.post', {
		body: JSON.stringify({
			user_code: workflow.value.user_code,
			payload: launchPayload.value ? JSON.parse(launchPayload.value) : {},
		})
	})

	isLaunchDialogOpen.value = false;

	router.push(`/${store.realm_code}/${store.space_code}/w/workflow/${result.id}`)


}

async function exportToJson() {


	const data = {
		version: '2',
		workflow: {
			name: workflow.value.name,
			user_code: workflow.value.user_code,
			created_at: workflow.created_at,
			modified_at: workflow.modified_at,
			default_payload: JSON.parse(defaultPayload.value),
			nodes: [],
			connections: []
		}
	}

	const nodes = await editor.getNodes()

	for (const node of nodes) {
		data.workflow.nodes.push(node)
	}

	const connections = await editor.getConnections()

	for (const connection of connections) {
		data.workflow.connections.push(connection)
	}

	return data

}

async function save() {

	const jsonData = await exportToJson()

	workflow.value.data = jsonData

	console.log('workflow.value', workflow.value)

	const result = await useApi('workflowTemplate.put', {
		params: {id: route.params.id},
		body: JSON.stringify(workflow.value)
	})

	useNotify({
		type: 'success',
		title: 'Success',
		text: 'Workflow Template is Saved'
	})
}

async function setupGraph() {

	const container = document.getElementById('editor');

	// Initialize the Rete.js editor
	editor = new NodeEditor('demo@0.1.0', container);

	editorArea = new AreaPlugin(container);
	const render = new VuePlugin();
	const connection = new ConnectionPlugin()

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
	connection.addPreset(ConnectionPresets.classic.setup())

	editor.use(editorArea);
	editorArea.use(render);
	editorArea.use(connection);
}

// Rete.js Setup
onMounted(async () => {

	await setupGraph();
	await init();
	await getWorkflows();


});
</script>

<style lang="postcss" scoped>
.workflow-detail-page {
	display: flex;
	height: 100vh;
}

/* Left side for Rete.js Editor */
.workflow-graph-section {
	flex: 0.7;
	background-color: #f0f0f0;
	padding: 10px;
}

#editor {
	width: 100%;
	height: 100%;
	border: 1px solid #ccc;
}

/* Right side for Workflow Details */
.workflow-detail-section {
	flex: 0.3;
	background-color: #fff;
	padding: 20px;
	border-left: 1px solid #ccc;
	overflow-y: auto;
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

.workflow-template-designer-section {
	padding: 4px 8px;
	border: 1px solid #ddd;
}
</style>
