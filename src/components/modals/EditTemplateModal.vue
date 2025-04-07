<template>
	<BaseModal
		title="Copy workflow template"
		:isOpen="true"
		width="40vw"
		height="40%"
		minHeight="400px"
		@closeModal="closeModal"
		@okModal="createWorkflow"
	>
		<form class="workflow-form">
			<div class="form-group">
				<label for="name">Workflow Name</label>
				<FmTextField
					v-model="formState.name"
					label="Daily"
					:rules="[rules.required]"
					outlined
					clearable
				/>
			</div>
			<div class="form-group">
				<label for="user_code">User Code</label>
				<FmTextField
					v-model="formState.user_code"
					label="com.finmars.local:daily"
					:rules="[rules.required]"
					outlined
					clearable
				/>
			</div>
		</form>
	</BaseModal>
</template>

<script setup>
import BaseModal from "~/components/base/Modal.vue";
import {FmTextField} from "@finmars/ui";

const props = defineProps({
	name: String,
	userCode: String,
	notes: String,
	data: Object,
})
const emits = defineEmits(['close', 'update'])

const formState = reactive({
	name: props.name,
	user_code: props.userCode,
})

const rules = {
	required: value => value ? '' : 'Field is required'
}

async function createWorkflow() {
	const res = await useApi('workflowTemplate.post', {
		body: {
			name: formState.name,
			user_code: formState.user_code,
			data: props.data,
			notes: props.notes,
		},
		notifyError: false
	});

	if (res?._$error) {
		useNotify({
			type: 'error',
			title: 'Error',
			text: res?._$error.error?.details?.errors?.[0]?.detail || 'Failed to create the Workflow Template.'
		});

		return;
	}
	useNotify({
		type: 'success',
		title: 'Success',
		text: 'Workflow Template created successfully!'
	});

	emits('update');
	closeModal()
}

function closeModal() {
	emits('close');
}
</script>

<style scoped>
.workflow-form {
	display: flex;
	flex-direction: column;
}

.form-group {
	margin-bottom: 20px;
}

label {
	display: block;
	font-size: 1.1rem;
	font-weight: 600;
	margin-bottom: 8px;
}
</style>
