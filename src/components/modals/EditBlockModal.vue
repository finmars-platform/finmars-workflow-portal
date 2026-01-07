<template>
	<BaseModal
		:title="title"
		:modelValue="true">
		{{ formState.nodeUserCode }}
		<!-- Node Name -->
		<div class="input-group">
			<label for="node-user-code-modal">Node Name (Unique Step Name):</label>
			<input id="node-user-code-modal" v-model="formState.nodeName" type="text" placeholder="e.g., Step 1"
				   class="input-field"/>
		</div>

		<!-- Node User Code -->
		<div class="input-group">
			<label for="node-user-code-modal">Node User Code (Unique Step Name ASCII only):</label>
			<input id="node-user-code-modal" v-model="formState.nodeUserCode" type="text" placeholder="e.g., step1"
				   class="input-field"/>
		</div>

		<!-- Node Notes -->
		<div class="input-group">
			<label for="node-notes-modal">Node Notes:</label>
			<input id="node-notes-modal" v-model="formState.nodeNotes" type="text"
				   placeholder="This task is going to do..." class="input-field"/>
		</div>

		<!-- Node Type Selector -->
		<div class="input-group">
			<label for="workflow-select-modal">Select Node Type</label>
			<select v-model="formState.nodeType" id="workflow-select-modal" class="input-field">
				<option value="workflow">Workflow (external module)</option>
				<option value="source_code">Source Code</option>
				<option value="condition">Condition</option>
			</select>
		</div>

		<!-- Conditional Sections -->
		<div v-if="formState.nodeType === 'workflow'" class="input-group">
			<label for="workflow-select-modal">Add Workflow Block</label>
			<select v-model="formState.selectedWorkflow" id="workflow-select-modal" class="input-field">
				<option v-for="workflow in availableWorkflows" :key="workflow.user_code" :value="workflow">
					{{ workflow.user_code }}
				</option>
			</select>
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
		<template #controls="{ cancel }">
			<div class="flex flex-row justify-between">
				<FmButton type="secondary" class="action-btn" @click="closeModal">CANCEL</FmButton>

				<FmButton type="secondary" class="action-btn" @click="save">Save</FmButton>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>
import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

const props = defineProps({
	action: String, // 'copy', 'edit'
	nodeId: String,
	nodeName: String,
	nodeUserCode: String,
	nodeNotes: String,
	nodeType: String,
	selectedWorkflow: Object,
	availableWorkflows: Object,
	sourceCode: String,
})

const formState = reactive({
	nodeName: props.nodeName,
	nodeUserCode: props.nodeUserCode,
	nodeNotes: props.nodeNotes,
	nodeType: props.nodeType,
	selectedWorkflow: props.selectedWorkflow,
	sourceCode: props.sourceCode,
})

const title = computed(() => {
	switch (props.action) {
		case 'edit':
			return `Edit block`
		default:
			return `Copy block`
	}
})

const emits = defineEmits(['payloadEditorInit', 'close', 'save'])

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

.input-field {
	width: 100%;
	padding: 10px;
	border: 1px solid #ccc;
	border-radius: 5px;
	box-sizing: border-box;
}
</style>
