<template>
	<div class="run-workflow-content">
		<div class="pb-4">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<h3>{{ activeWorkflowItem?.user_code }}</h3>
		<div>
			<p>Payload:</p>
			<v-ace-editor
				v-model:value="activeWorkflowPayload"
				@init="editorInit"
				lang="json"
				theme="monokai"
				class="payload-editor"
			/>
		</div>
		<div>
			<div class="run-workflow-footer">
				<FmButton type="primary" @click="runWorkflow($event, activeWorkflowItem)" rounded>
					Run
				</FmButton>
				<FmButton type="secondary" @click="cancel" rounded>
					Cancel
				</FmButton>
			</div>
		</div>
	</div>
</template>

<script setup>

import { FmButton, FmBreadcrumbs } from "@finmars/ui";
import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

definePageMeta({
	middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const store = useStore();

const crumbs = ref([
	{ title: 'Home', path: 'home' },
	{ title: 'Run Workflow', path: 'run' }
]);

const activeWorkflowItem = ref(null);
const activeWorkflowPayload = ref('');

const handleCrumbs = (newCrumbs, newPath) => {
	router.push(`/${store.realm_code}/${store.space_code}/w` + newPath);
};

function editorInit(editor) {
	editor.setHighlightActiveLine(false);
	editor.setShowPrintMargin(false);
	editor.setFontSize(14);
	editor.setBehavioursEnabled(true);
	editor.focus();
	editor.navigateFileStart();
}

async function runWorkflow($event, item) {
	const res = await useApi('runWorkflow.post', {
		body: JSON.stringify({
			user_code: item.user_code,
			payload: activeWorkflowPayload.value ? JSON.parse(activeWorkflowPayload.value) : {},
		})
	});

	if (res && res._$error) {
		useNotify({
			type: 'error',
			title: res._$error.message || res._$error.error.details
		});
	} else {
		useNotify({
			type: 'success',
			title: 'Workflow Executed',
			text: `Task ID: ${res.id}`
		});
	}
}

function cancel(){
	store.clearWorkflowItem();
	usePrefixedRouterPush(router, route, '/home');
}

function init() {
	activeWorkflowItem.value = store.workflowItem;

	if (activeWorkflowItem.value.default_payload) {
		activeWorkflowPayload.value = JSON.stringify(activeWorkflowItem.value.default_payload, null, 4);
	}
}

init();
</script>

<style scoped lang="postcss">
.run-workflow-content {
	margin: 0 20px 20px 20px;
}

.payload-editor {
	width: 100%;
	height: 400px;
	border: 1px solid #ddd;
	margin-top: 1rem;
}

.run-workflow-footer {
	display: flex;
	justify-content: flex-start;
	margin-top: 1rem;
	gap: 2rem;
}
</style>
