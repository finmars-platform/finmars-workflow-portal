<template>
	<div class="workflow-detail-page">
		<div class="pb-2">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs"/>
		</div>
		<div class="flex">
			<div class="workflow-graph-section">
				<div id="editor" class="editor"></div>
			</div>

			<div class="workflow-detail-section">
				<h2 class="pb-2">Workflow Template Details</h2>

				<div class="button-group">
					<FmIconButton icon="mdi-play" @click="openLaunchDialog" size="small">
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Launch
						</FmTooltip>
					</FmIconButton>
					<FmIconButton icon="mdi-content-save" @click="save" size="small">
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Save
						</FmTooltip>
					</FmIconButton>
					<FmIconButton icon="mdi-text-box-check" @click="openTemplateFile" size="small">
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Open template
						</FmTooltip>
					</FmIconButton>
					<FmIconButton icon="mdi-arrange-bring-forward" @click="arrangeNodes" size="small">
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Arrange Nodes
						</FmTooltip>
					</FmIconButton>
					<FmIconButton icon="mdi-code-tags" @click="showEditAsJsonDialog" size="small">
						<FmTooltip activator="parent" type="secondary" location="bottom">
							Edit as JSON
						</FmTooltip>
					</FmIconButton>
				</div>

				<table class="workflow-info-table">
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
						<td>Name</td>
						<td>
							<div class="form-group">
								<FmTextField
									v-model="workflow.name"
									:rules="[rules.required]"
									label="Daily"
									outlined
									clearable
								/>
							</div>
						</td>
					</tr>
					<tr>
						<td>Notes</td>
						<td>
							<div class="form-group">
								<FmTextField
									v-model="workflow.notes"
									label="Daily for ..."
									outlined
									clearable
								/>
							</div>
						</td>
					</tr>
					<tr>
						<td>Created</td>
						<td>{{ $formatDate(workflow.created_at) }}</td>
					</tr>
					<tr>
						<td>Modified</td>
						<td>{{ $formatDate(workflow.modified_at) }}</td>
					</tr>
					</tbody>
				</table>

				<!-- Default Payload Section -->
				<div class="payload-section">
					<h3>Default Payload</h3>
					<v-ace-editor
						v-model:value="defaultPayload"
						@init="payloadEditorInit"
						lang="json"
						theme="monokai"
						style="height: 300px;width: 100%;"/>
				</div>

				<!-- Workflow Designer Section -->
				<div class="workflow-template-designer-section">
					<h2>Workflow Designer</h2>

					<!-- Node Name -->
					<div class="input-group">
						<label for="node-user-code">Node Name (Unique Step Name):</label>
						<FmTextField
							v-model="nodeName"
							label="e.g., Step 1"
							outlined
							clearable
						/>
					</div>

					<!-- Node User Code -->
					<div class="input-group">
						<label for="node-user-code">Node User Code (Unique Step Name ASCII only):</label>
						<FmTextField
							v-model="nodeUserCode"
							label="e.g., Step 1"
							outlined
							clearable
						/>
					</div>

					<!-- Node Notes -->
					<div class="input-group">
						<label for="node-notes">Node Notes:</label>
						<FmTextField
							v-model="nodeNotes"
							label="This task is going to do..."
							outlined
							clearable
						/>
					</div>

					<!-- Node Type Selector -->
					<div class="input-group">
						<label for="workflow-select">Select Node Type</label>
						<FmSelect
							v-model="nodeType"
							variant="outlined"
							:options="nodeTypeOptions"
							@update:modelValue="updateNodeTypeOpt"
						/>
					</div>

					<!-- Conditional Sections -->
					<div v-if="nodeType === 'workflow'" class="input-group">
						<label for="workflow-select">Add Workflow Block</label>
						<FmSelect
							v-model="selectedWorkflow"
							variant="outlined"
							:options="getAvailableWorkflowsOpt"
							@update:modelValue="updateAvailableWorkflows"
						/>
					</div>

					<div v-if="nodeType === 'source_code'" class="input-group">
						<label for="node-source-code">Enter Source Code:</label>
						<v-ace-editor
							v-model:value="sourceCode"
							@init="payloadEditorInit"
							lang="python"
							theme="monokai"
							style="height: 150px; width: 100%;"/>
					</div>

					<div v-if="nodeType === 'condition'" class="input-group">
						<label for="node-condition-code">Enter Condition Logic:</label>
						<v-ace-editor
							v-model:value="conditionCode"
							@init="payloadEditorInit"
							lang="python"
							theme="monokai"
							style="height: 150px; width: 100%;"/>
					</div>

					<FmButton type="primary" rounded @click="addBlock">Add Block</FmButton>

					<!-- Display Existing Blocks -->
					<ul class="block-list">
						<div v-for="block in blocks" :key="block.id" class="block-item">
							{{ block.node.user_code }} - {{ block.name }}
							<FmButton type="primary" rounded @click="removeBlock(block.id)">Remove</FmButton>
						</div>
					</ul>

				</div>

				<div class="workflow-template-designer-section">
					<h2>Comments</h2>
					<!-- Node Name -->
					<div class="input-group">
						<label for="comment-text">Comment:</label>
						<FmTextField
							v-model="commentText"
							label="This step is for..."
							outlined
							clearable
						/>
					</div>
					<FmButton type="primary" rounded @click="addComment">Add Comment</FmButton>
				</div>
				<div style="margin-top: 8px;">
					<FmButton type="primary" rounded @click="openDeleteWorkflowTemplate">Delete Workflow Template
					</FmButton>
				</div>

			</div>
		</div>

		<BaseModal
			title="Launch Workflow"
			text="Note that a new workflow will be created, so the current one will not be changed and will still be available in your history."
			:isOpen="isLaunchDialogOpen"
			@closeModal="isLaunchDialogOpen = !isLaunchDialogOpen"
			@okModal="relaunch"
		>
			<v-ace-editor
				v-model:value="launchPayload"
				@init="payloadEditorInit"
				lang="json"
				theme="monokai"
				style="height: 300px;width: 100%;"/>
		</BaseModal>

		<BaseModal
			title="Edit as JSON"
			text="Note that a new workflow will be created, so the current one will not be changed and will still be available in your history."
			:isOpen="isEditAsJsonDialogOpen"
			@closeModal="isEditAsJsonDialogOpen = !isEditAsJsonDialogOpen"
			@okModal="saveAsJson"
		>
			<v-ace-editor
				v-model:value="workflowTemplateJson"
				@init="payloadEditorInit"
				lang="json"
				theme="monokai"
				style="height: 100%;width: 100%;"/>
		</BaseModal>

		<FmConfirm
			title="Delete Workflow template"
			:isOpen="isShowConfirm"
			@closeModal="isShowConfirm = false"
			@okModal="deleteWorkflowTemplate"
		>
			<span>Are you sure you want to delete {{ selectedWorkflow.name }} ?</span>
		</FmConfirm>

		<EditBlockModal
			v-if="editBlock"
			:action="editBlock.action"
			:nodeId="editBlock.nodeId"
			:nodeName="editBlock.nodeName"
			:nodeUserCode="editBlock.nodeUserCode"
			:nodeNotes="editBlock.nodeNotes"
			:nodeType="editBlock.nodeType"
			:selectedWorkflow="editBlock.selectedWorkflow"
			:availableWorkflows="availableWorkflows"
			:sourceCode="editBlock.sourceCode"
			@close="editBlock = null"
			@save="onSaveEditBlock"
		/>
	</div>
</template>

<script setup>
import {FmBreadcrumbs, FmButton, FmIconButton, FmTooltip, FmTextField, FmSelect} from "@finmars/ui";
import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

import {ClassicPreset, NodeEditor} from "rete";
import {AreaExtensions, AreaPlugin} from 'rete-area-plugin';
import {ConnectionPlugin, Presets as ConnectionPresets} from "rete-connection-plugin"
import {Presets, VuePlugin} from 'rete-vue-plugin';
import {AutoArrangePlugin, Presets as ArrangePresets} from "rete-auto-arrange-plugin";
import {CommentPlugin} from "rete-comment-plugin";

import WorkflowTemplateNode from "~/components/WorkflowTemplateNode.vue";
import EditBlockModal from "~/components/modals/EditBlockModal.vue";
import BaseModal from "~/components/base/Modal.vue";
import FmConfirm from "~/components/fm/Confirm.vue";

const router = useRouter();
const route = useRoute();

const store = useStore();
store.init();

definePageMeta({
	middleware: "auth",
});

let workflowTemplateJson = ref('');
let isEditAsJsonDialogOpen = ref(false);
let isLaunchDialogOpen = ref(false);
let launchPayload = ref('')
let defaultPayload = ref(`
{"report_date": "2024-10-10"}
`)
const editBlock = ref(null)

const isShowConfirm = ref(false);
const selectedWorkflow = ref({});
let availableWorkflows = ref([]);
let commentText = ref("");
let nodeUserCode = ref("");
let nodeName = ref("");
let nodeType = ref("workflow");
let nodeNotes = ref("");
let sourceCode = ref(`
def main(self, *args, **kwargs):
    self.log("Hello World")

    return {"status": "success"}
`);
let conditionCode = ref(`
def main(self, *args, **kwargs):
    self.log("Hello World")

    return {"result": True}
`);

async function getWorkflows() {
	availableWorkflows.value = await useApi('definitionList.get');
}

const nodeTypeOptions = [
	{title: 'Workflow (external module)', value: 'workflow'},
	{title: 'Source Code', value: 'source_code'},
	{title: 'Condition', value: 'condition'}
];

let workflow = ref({});
let editor;
let editorArea;
let editorArrange;
let editorComment;

const blocks = ref([]);

const crumbs = ref([
	{title: 'Workflow template', path: 'workflow-template'},
	{title: 'Edit Workflow template', path: 'edit'}
]);

const rules = {
	required: value => value ? '' : 'Field is required'
}

const getAvailableWorkflowsOpt = computed(() => {
	return availableWorkflows.value.map(workflow => ({
		title: workflow.user_code,
		value: workflow.user_code,
	}));
});

const handleCrumbs = (newCrumbs, newPath) => {
	router.push(`/${store.realm_code}/${store.space_code}/w` + newPath);
};

function updateNodeTypeOpt(val) {
	nodeType.value.enabled = val;
}

function updateAvailableWorkflows(val) {
	selectedWorkflow.value = val;
}

async function addBlock() {
	// Ensure the `node_user_code` is provided and unique
	if (!nodeUserCode.value) {
		alert("Please enter a unique Node User Code");
		return;
	}

	if (!nodeName.value) {
		alert("Please enter a unique Node User Code");
		return;
	}

	const existingNode = blocks.value.find(block => block.node_user_code === nodeUserCode.value);
	if (existingNode) {
		alert("Node User Code must be unique. Please choose a different code.");
		return;
	}

	let workflow = {}

	if (selectedWorkflow.value) {
		workflow.name = selectedWorkflow.value.name
		workflow.user_code = selectedWorkflow.value.user_code
	}

	let source_code = ''

	if (sourceCode.value) {
		source_code = sourceCode.value
	} else {
		source_code = conditionCode.value
	}

	// Create a new node with the provided user_code and node_user_code
	const node = await createNode(workflow, nodeUserCode.value, nodeName.value, nodeType.value, nodeNotes.value, source_code, 100, 100);
	await editor.addNode(node);
	blocks.value.push({id: node.id, node: {name: nodeName.value, user_code: nodeUserCode.value}});

	// Reset `nodeUserCode` for future additions
	nodeUserCode.value = "";
	nodeNotes.value = "";
	nodeName.value = "";
	sourceCode.value = `
def main(self, *args, **kwargs):
    self.log("Hello World")

    return {"status": "success"}
`;
	conditionCode.value = `
def main(self, *args, **kwargs):
    self.log("Hello World")

    return True
`;
}

async function addComment() {
	await editorComment.addInline(commentText.value, [100, 100]);
	commentText.value = "";
}

async function createNode(workflow, node_user_code, node_name, node_type, node_notes, node_source_code, x, y) {
	const node = await new ClassicPreset.Node(name);
	node.position = [x, y];
	node.height = undefined;
	node.width = 400;
	node.name = node_name;
	node.data = {
		node: {
			// System defined user code (like `com.finmars.example-etl:download`)
			user_code: node_user_code, // Custom defined by the user, like "step1"
			name: node_name, // Custom defined by the user, like "step1"
			notes: node_notes,
			type: node_type
		},
		workflow: {
			name: workflow.name,
			user_code: workflow.user_code
		},
		source_code: node_source_code

	};

	const payloadInputSocket = new ClassicPreset.Socket("payload_socket");
	node.addInput("payload_input", new ClassicPreset.Input(payloadInputSocket, "Payload"));

	const inputSocket = new ClassicPreset.Socket("socket");
	node.addInput("in", new ClassicPreset.Input(inputSocket, "Input"));

	if (node_type === 'condition') {
		const outputTrueSocket = new ClassicPreset.Socket("socket_true");
		const outputFalseSocket = new ClassicPreset.Socket("socket_false");
		node.addOutput("out_true", new ClassicPreset.Output(outputTrueSocket, 'Output True', false));
		node.addOutput("out_false", new ClassicPreset.Output(outputFalseSocket, 'Output False', false));
	} else {
		const outputSocket = new ClassicPreset.Socket("socket");
		node.addOutput("out", new ClassicPreset.Output(outputSocket, "Output"));
	}
	return node;
}

async function removeBlock(id) {
	const node = await editor.getNode(id);
	const connections = await editor.getConnections()
	for (const connection of connections) {
		if (node.id === connection.source || node.id === connection.target) {
			await editor.removeConnection(connection.id);
		}
	}
	await editor.removeNode(node.id);
	blocks.value = blocks.value.filter(block => block.id !== id);
}

async function getWorkflow() {
	const res = await useApi('workflowTemplate.get', {params: {id: route.params.id}});
	if (res && res._$error) {
		useNotify({
			type: 'error',
			title: res._$error.message || res._$error.error.details
		});
	} else {
		workflow.value = res;
		if (workflow.value.data) {
			defaultPayload.value = JSON.stringify(workflow.value.data.workflow.default_payload, null, 4) || ""
		}
		await initGraph();
	}
}

async function init() {
	await getWorkflow();
}

function payloadEditorInit(payloadEditor) {
	payloadEditor.setHighlightActiveLine(false);
	payloadEditor.setShowPrintMargin(false);
	payloadEditor.setFontSize(14)
	payloadEditor.setBehavioursEnabled(true);

	payloadEditor.focus();
	payloadEditor.navigateFileStart();
}

function initGraph() {
	setTimeout(async () => {
		await editor.clear();
		if (workflow.value.data) {
			const nodeMap = {};
			blocks.value = []

			for (const node of workflow.value.data.workflow.nodes) {
				blocks.value.push({id: node.id, name: node.name, node: node.data.node});
				await editor.addNode(node);
				await editorArea.translate(node.id, {x: node.position.x, y: node.position.y});
				nodeMap[node.id] = node;
			}

			for (const connectionItem of workflow.value.data.workflow.connections) {
				const sourceNode = await editor.getNode(connectionItem.source);
				const targetNode = await editor.getNode(connectionItem.target);
				const connection = new ClassicPreset.Connection(sourceNode, connectionItem.sourceOutput, targetNode, connectionItem.targetInput)
				await editor.addConnection(
					connection
				);
			}

			if (workflow.value.data.workflow.comments) {
				for (const comment of workflow.value.data.workflow.comments) {
					await editorComment.addInline(comment.text, [comment.x, comment.y]);
				}
			}
		}

		editorArea.addPipe(async context => {
			if (context.type === 'nodetranslated') {
				const node = await editor.getNode(context.data.id);
				node.position = context.data.position
			}
			return context
		})
		await AreaExtensions.zoomAt(editorArea, editor.getNodes());
	}, 2000)
}

// Delete the schedule
function openDeleteWorkflowTemplate() {
	isShowConfirm.value = true;
}

async function deleteWorkflowTemplate() {
	try {
		const res = await useApi('workflowTemplate.delete', {
			params: {id: route.params.id}
		});
		if (res && res._$error) {
			useNotify({
				type: 'error',
				title: res._$error.message || res._$error.error.details
			});
		} else {
			useNotify({
				type: 'success',
				text: 'Workflow Template deleted successfully!'
			});
			router.push(`/${store.realm_code}/${store.space_code}/w/workflow-template/`);
		}
	} catch (error) {
		useNotify({
			type: 'error',
			title: 'Error',
			text: 'Failed to delete the Workflow Template.'
		});
	} finally {
		isShowConfirm.value = false;
	}
}

async function refresh() {
	// await init();
	await getWorkflow();
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
			connections: [],
			comments: []
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

	const comments = Array.from(editorComment.comments.values())

	for (const comment of comments) {
		data.workflow.comments.push(comment)
	}

	return data

}

async function save() {
	const jsonData = await exportToJson()
	workflow.value.data = jsonData
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
	editorArrange = new AutoArrangePlugin();
	editorComment = new CommentPlugin({
		edit: async (comment) => {
			const result = prompt('Edit comment', comment.text)

			if (result) {
				return result
			} else {
				await editorComment.delete(comment.id)
			}
		}
	});

	const background = document.createElement("div");
	background.classList.add("pano-background");
	background.classList.add("pano-fill-area");
	editorArea.area.content.add(background);

	// Apply "classic" preset for default node appearance
	render.addPreset(Presets.classic.setup({
		customize: {
			node(context) {
				return defineComponent({
					name: 'NodeWrapper',
					setup() {
						return () => h(WorkflowTemplateNode, {
							onCopyBlock: openCopyModal,
							onDeleteBlock: removeBlock
						})
					}
				});
			}
		}
	}));
	connection.addPreset(ConnectionPresets.classic.setup())
	editorArrange.addPreset(ArrangePresets.classic.setup());

	editor.use(editorArea);
	editorArea.use(render);
	editorArea.use(connection);
	editorArea.use(editorArrange);
	editorArea.use(editorComment);
}

function openTemplateFile() {
	let pieces = workflow.value.user_code.split(':')
	let workflow_user_code = pieces[1]
	let workflow_path = pieces[0].split('.').join('/')
	const link = window.location.origin + `/${store.realm_code}/${store.space_code}/a/#!/explorer/workflows/${workflow_path}/${workflow_user_code}/workflow.json`

	window.open(link, '_blank')

}

async function arrangeNodes() {
	await editorArrange.layout();
}

function showEditAsJsonDialog() {
	workflowTemplateJson.value = JSON.stringify(workflow.value, null, 4)
	isEditAsJsonDialogOpen.value = true
}

async function saveAsJson() {
	const result = await useApi('workflowTemplate.put', {
		params: {id: route.params.id},
		body: workflowTemplateJson.value
	})

	useNotify({
		type: 'success',
		title: 'Success',
		text: 'Workflow Template is Saved'
	})

	isEditAsJsonDialogOpen.value = false
	await refresh();
}

async function openCopyModal(nodeId, action) {
	const originalNode = await editor.getNode(nodeId);
	if (!originalNode) return;

	const nodeData = originalNode.data;
	editBlock.value = {
		action,
		nodeId,
		nodeName: nodeData.node?.name,
		nodeUserCode: nodeData.node?.user_code,
		nodeNotes: nodeData.node?.notes,
		nodeType: nodeData.node?.type,
		selectedWorkflow: availableWorkflows.value?.find(item => item?.user_code === nodeData?.workflow?.user_code) || {},
		sourceCode: nodeData.source_code || '',
	}
}

async function onSaveEditBlock(payload) {
	const originalNode = await editor.getNode(payload.nodeId);
	if (!originalNode) return;

	if (payload.action === 'edit') {
		originalNode.data.node.name = payload.nodeName;
		originalNode.data.name = payload.nodeName;
		originalNode.name = payload.nodeName;
		originalNode.data.node.type = payload.nodeType;
		originalNode.data.node.notes = payload.nodeNotes;
		originalNode.data.node.user_code = payload.nodeUserCode;
		originalNode.data.source_code = payload.sourceCode;
		originalNode.data.workflow.name = payload.selectedWorkflow?.name;
		originalNode.data.workflow.user_code = payload.selectedWorkflow?.user_code;

		if (payload.isNodeTypeChanged) {
			const connections = await editor.getConnections()
			for (const connection of connections) {
				if (originalNode.id === connection.source || originalNode.id === connection.target) {
					await editor.removeConnection(connection.id);
				}
			}
		}


		editorArea.update('node', originalNode.id);
	} else if (payload.action === 'copy') {
		const nodeData = originalNode.data;
		const position = originalNode.position

		const nodeName = nodeData.node?.name !== payload.nodeName ? payload.nodeName : nodeData.node?.name + ' (copy)';
		const nodeUserCode = nodeData.node?.user_code !== payload.nodeUserCode ? payload.nodeUserCode : +new Date();
		const nodeType = payload.nodeType;
		const nodeNotes = payload.nodeNotes;
		const sourceCode = payload.sourceCode;
		const workflowRef = nodeData.workflow || {};

		const newNode = await createNode(
			workflowRef,
			nodeUserCode,
			nodeName,
			nodeType,
			nodeNotes,
			sourceCode,
			position.x + 40,
			position.y + 40,
		);

		await editor.addNode(newNode);
		await editorArea.translate(newNode.id, {x: position.x + 40, y: position.y + 40});

		blocks.value.push({
			id: newNode.id,
			node: {
				name: nodeName,
				user_code: nodeUserCode
			}
		});
	}
}

// Rete.js Setup
onMounted(async () => {
	await getWorkflow();
	await getWorkflows();
	await setupGraph();
	await initGraph();
})

</script>

<style scoped>
.workflow-detail-page {
	padding: 0 20px 20px 20px;
}

/* Left side for Rete.js Editor */
.workflow-graph-section {
	flex: 0.7;
	padding: 15px;
}

#editor {
	width: 100%;
	height: 100%;
	border: 2px solid #ccc;
	border-radius: 5px;
}

/* Right side for Workflow Details */
.workflow-detail-section {
	flex: 0.3;
	padding: 15px 35px 15px 15px;
	border-left: 1px solid #ccc;
	height: calc(100vh - 220px);
	overflow-y: auto;
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

/* Workflow Information Table */
.workflow-info-table {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 20px;
}

.workflow-info-table td {
	padding: 10px;
	border-bottom: 1px solid #ddd;
}

/* Input Group Styles */
.input-group {
	margin-bottom: 15px;
}

/* Block List Styles */
.block-list {
	list-style-type: none;
	padding-left: 0;
	margin-top: 20px;
}

.block-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px;
	border: 1px solid #ddd;
	margin-bottom: 10px;
	border-radius: 5px;
}

.payload-section {
	margin-top: 20px;
}
</style>
