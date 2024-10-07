<template>
	<div>

		<table>
			<thead>
			<tr>
				<th>Name</th>
				<th>User Code</th>
				<th>Is Manager</th>
				<th></th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="item in definitions">
				<td>{{ item.name }}</td>
				<td>{{ item.user_code }}</td>
				<td>{{ item.is_manager }}</td>
				<th>
					<fm-btn @click="openRunWorkflowDialog($event, item)">Run</fm-btn>
				</th>
			</tr>
			</tbody>
		</table>

	</div>


	<fm-base-modal
		title="Run Workflow"
		v-model="isRunWorkflowDialog"
	>

		<h2>{{ activeWorkflowItem?.user_code }}</h2>


		<p style="margin-top: 1rem">Payload</p>
		<v-ace-editor
			v-model:value="activeWorkflowPayload"
			@init="editorInit"
			lang="json"
			theme="monokai"
			style="height: 300px;width: 600px;"/>

		<template #footer>
			<div class="flex flex-row justify-between">
				<fm-btn type="text" @click="isRunWorkflowDialog = !isRunWorkflowDialog">Cancel</fm-btn>

				<fm-btn type="filled" @click="runWorkflow($event, activeWorkflowItem)">Run</fm-btn>
			</div>
		</template>
	</fm-base-modal>

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

let isRunWorkflowDialog = ref(false);
let activeWorkflowItem = ref(null)
let activeWorkflowPayload = ref('')

function openRunWorkflowDialog($event, item) {
	// alert("Run Workflow " + item.user_code)

	isRunWorkflowDialog.value = true;
	activeWorkflowItem.value = item;

	if (item.default_payload) {
		activeWorkflowPayload.value = JSON.stringify(item.default_payload, null, 4);
	}

	console.log('openRunWorkflowDialog', activeWorkflowItem)
	console.log('isRunWorkflowDialog', isRunWorkflowDialog)

}

async function runWorkflow($event, item) {

	const result = await useApi('runWorkflow.post', {
		body: JSON.stringify({
			user_code: item.user_code,
			payload: activeWorkflowPayload.value ? JSON.parse(activeWorkflowPayload.value) : {},
		})
	})

	console.log('result', result);

	isRunWorkflowDialog.value = false;

	useNotify({
		type: 'success',
		title: 'Workflow is Executed ' + item.user_code,
		text: 'Task ID: ' + result.id
	})
}

function editorInit(editor) {
	editor.setHighlightActiveLine(false);
	editor.setShowPrintMargin(false);
	editor.setFontSize(14)
	editor.setBehavioursEnabled(true);

	editor.focus();
	editor.navigateFileStart();
}

const definitions = await useApi('definitionList.get')
console.log('definitions', definitions);

</script>

<style scoped lang="postcss">

</style>
