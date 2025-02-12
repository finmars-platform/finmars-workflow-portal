<template>
	<fm-base-modal
		title="Copy workflow template"
		:modelValue="true">
		<form @submit.prevent class="workflow-form">
			<div class="form-group">
				<label for="name">Workflow Name</label>
				<input id="name" v-model="formState.name" type="text" required class="form-control"
					   placeholder="Daily"/>
			</div>

			<div class="form-group">
				<label for="user_code">User Code</label>
				<input id="user_code" v-model="formState.user_code" type="text" required class="form-control"
					   placeholder="com.finmars.local:daily"/>
			</div>
		</form>
		<template #footer>
			<div class="flex flex-row justify-between">
				<fm-btn type="text" @click="closeModal">CANCEL</fm-btn>

				<fm-btn type="filled" @click="createWorkflow">Save</fm-btn>
			</div>
		</template>
	</fm-base-modal>
</template>

<script setup>
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
	color: #555;
}

.form-control {
	width: 100%;
	padding: 10px;
	font-size: 1rem;
	border-radius: 5px;
	border: 1px solid #ddd;
	transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
	border-color: #007bff; /* Blue border on focus */
	box-shadow: 0 0 8px rgba(0, 123, 255, 0.2); /* Subtle glow effect */
	outline: none;
}
</style>
