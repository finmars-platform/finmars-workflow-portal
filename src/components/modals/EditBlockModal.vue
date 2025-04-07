<template>
	<BaseModal
		:title="title"
		:isOpen="true"
		@closeModal="closeModal"
		@okModal="save"
	>
		{{ formState.nodeUserCode }}
		<!-- Node Name -->
		<div class="input-group">
			<label for="node-user-code-modal">Node Name (Unique Step Name):</label>
			<FmTextField
				v-model="formState.nodeName"
				label="e.g., Step 1"
				outlined
				clearable
			/>
		</div>

		<!-- Node User Code -->
		<div class="input-group">
			<label for="node-user-code-modal">Node User Code (Unique Step Name ASCII only):</label>
			<FmTextField
				v-model="formState.nodeUserCode"
				label="e.g., Step 1"
				outlined
				clearable
			/>
		</div>

		<!-- Node Notes -->
		<div class="input-group">
			<label for="node-notes-modal">Node Notes:</label>
			<FmTextField
				v-model="formState.nodeNotes"
				label="This task is going to do..."
				outlined
				clearable
			/>
		</div>

		<!-- Node Type Selector -->
		<div class="input-group">
			<label for="workflow-select-modal">Select Node Type</label>
			<FmSelect
				v-model="formState.nodeType"
				variant="outlined"
				:options="nodeTypeOptions"
				@update:modelValue="updateNodeTypeOpt"
			/>
		</div>

		<!-- Conditional Sections -->
		<div v-if="formState.nodeType === 'workflow'" class="input-group">
			<label for="workflow-select-modal">Add Workflow Block</label>
			<FmSelect
				v-model="formState.selectedWorkflow"
				variant="outlined"
				:options="getAvailableWorkflowsOpt"
				@update:modelValue="updateAvailableWorkflows"
			/>
		</div>

		<div v-if="formState.nodeType === 'source_code'" class="input-group">
			<label for="node-source-code">Enter Source Code:</label>
			<v-ace-editor
				v-model:value="formState.sourceCode"
				@init="payloadEditorInit"
				lang="python"
				theme="monokai"
				style="height: 150px; width: 100%;"/>
		</div>

		<div v-if="formState.nodeType === 'condition'" class="input-group">
			<label for="node-condition-code">Enter Condition Logic:</label>
			<v-ace-editor
				v-model:value="formState.sourceCode"
				@init="payloadEditorInit"
				lang="python"
				theme="monokai"
				style="height: 150px; width: 100%;"/>
		</div>
	</BaseModal>
</template>

<script setup>
import {FmSelect, FmTextField} from "@finmars/ui";
import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import BaseModal from "~/components/base/Modal.vue";

const props = defineProps({
	action: String, // 'copy', 'edit'
	nodeId: String,
	nodeName: String,
	nodeUserCode: String,
	nodeNotes: String,
	nodeType: String,
	selectedWorkflow: Object,
	availableWorkflows: Object,
	sourceCode: String
});

const formState = reactive({
	nodeName: props.nodeName,
	nodeUserCode: props.nodeUserCode,
	nodeNotes: props.nodeNotes,
	nodeType: props.nodeType,
	selectedWorkflow: props.selectedWorkflow,
	sourceCode: props.sourceCode,
});

const nodeTypeOptions = [
	{ title: 'Workflow (external module)', value: 'workflow' },
	{ title: 'Source Code', value: 'source_code' },
	{ title: 'Condition', value: 'condition' }
];

const getAvailableWorkflowsOpt = computed(()=>{
	return props.availableWorkflows.map(workflow => ({
		title: workflow.user_code,
		value: workflow.user_code,
	}));
});

const title = computed(() => {
	switch (props.action) {
		case 'edit':
			return `Edit block`
		default:
			return `Copy block`
	}
});

const emits = defineEmits(['payloadEditorInit', 'close', 'save'])

function updateNodeTypeOpt(val){
	formState.nodeType = val;
}

function updateAvailableWorkflows(val) {
	formState.selectedWorkflow = val;
}

function payloadEditorInit() {
	emits('payloadEditorInit');
}

function closeModal() {
	emits('close');
}

function save() {
	emits('save', Object.assign({}, formState, {
		isNodeTypeChanged: formState.nodeType !== props.nodeType,
		action: props.action,
		nodeId: props.nodeId
	}));
	closeModal()
}
</script>

<style scoped>
.input-group {
	margin-bottom: 15px;
}
</style>
