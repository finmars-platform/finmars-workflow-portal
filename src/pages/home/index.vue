<template>

	<div class="workflow-table-container">

		<FmButton type="primary" v-on:click="refreshStorage()">Refresh Storage</FmButton>

		<!-- Workflow Definitions Table -->
		<table class="workflow-table">
			<thead>
			<tr>
				<th>Name</th>
				<th>User Code</th>
				<th>Is Manager</th>
				<th>Actions</th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="item in definitions" :key="item.user_code">
				<td>{{ item.name }}</td>
				<td>{{ item.user_code }}</td>
				<td>{{ item.is_manager ? 'Yes' : 'No' }}</td>
				<td>
					<FmButton class="run-btn" @click="openRunWorkflowDialog($event, item)">Run</FmButton>
				</td>
			</tr>
			</tbody>
		</table>

		<!-- Run Workflow Modal -->
		<BaseModal
			title="Run Workflow"
			v-model="isRunWorkflowDialog"
			class="run-workflow-modal"
		>
			<h3>{{ activeWorkflowItem?.user_code }}</h3>

			<div class="payload-editor-container">
				<p>Payload:</p>
				<v-ace-editor
					v-model:value="activeWorkflowPayload"
					@init="editorInit"
					lang="json"
					theme="monokai"
					class="payload-editor"
				/>
			</div>

			<template #controls="{ cancel }">
				<div class="modal-footer">
					<FmButton type="secondary" @click="isRunWorkflowDialog = !isRunWorkflowDialog">Cancel</FmButton>
					<FmButton type="primary" @click="runWorkflow($event, activeWorkflowItem)">Run</FmButton>
				</div>
			</template>
		</BaseModal>

	</div>

</template>

<script setup>

import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

let store = useStore()
store.init();
definePageMeta({
	middleware: "auth",
});

let definitions = ref([])

async function refreshStorage() {
	await useApi('refreshStorage.get');

	useNotify({
		type: 'success',
		title: 'Success',
		text: 'Storage refreshed'
	});

	definitions = await useApi('definitionList.get');
}

let isRunWorkflowDialog = ref(false);
let activeWorkflowItem = ref(null);
let activeWorkflowPayload = ref('');

function openRunWorkflowDialog($event, item) {
	isRunWorkflowDialog.value = true;
	activeWorkflowItem.value = item;

	if (item.default_payload) {
		activeWorkflowPayload.value = JSON.stringify(item.default_payload, null, 4);
	}

	console.log('openRunWorkflowDialog', activeWorkflowItem);
}

async function runWorkflow($event, item) {
	const result = await useApi('runWorkflow.post', {
		body: JSON.stringify({
			user_code: item.user_code,
			payload: activeWorkflowPayload.value ? JSON.parse(activeWorkflowPayload.value) : {},
		})
	});

	console.log('result', result);

	isRunWorkflowDialog.value = false;

	useNotify({
		type: 'success',
		title: 'Workflow Executed',
		text: `Task ID: ${result.id}`
	});
}

function editorInit(editor) {
	editor.setHighlightActiveLine(false);
	editor.setShowPrintMargin(false);
	editor.setFontSize(14);
	editor.setBehavioursEnabled(true);
	editor.focus();
	editor.navigateFileStart();
}

definitions = await useApi('definitionList.get');
console.log('definitions', definitions);

</script>

<style scoped lang="postcss">
.workflow-table-container {
	margin: 20px;
}

.workflow-table {
	width: 100%;
	border-collapse: collapse;
}

.workflow-table th, .workflow-table td {
	padding: 12px;
	text-align: left;
	border-bottom: 1px solid #ddd;
}

.workflow-table th {
	//background-color: #f0f0f0;
	font-weight: bold;
}


.run-btn {
	//background-color: #007bff;
	color: white;
	border-radius: 4px;
	padding: 8px 12px;
	cursor: pointer;
	transition: background-color 0.3s ease;
}

.run-btn:hover {
	//background-color: #0056b3;
	opacity: .9;
}

.run-workflow-modal {
	max-width: 700px;
	width: 100%;
}

.payload-editor-container {
	margin-top: 1rem;
}

.payload-editor {
	width: 100%;
	height: 300px;
	border: 1px solid #ddd;
}

.modal-footer {
	display: flex;
	justify-content: space-between;
	//margin-top: 1rem;
}

.modal-footer FmButton {
	padding: 10px 20px;
}

</style>
