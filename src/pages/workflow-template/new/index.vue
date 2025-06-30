<template>
	<div class="new-workflow-page">
		<h1>Create New Workflow</h1>

		<!-- Workflow Creation Form -->
		<form @submit.prevent="createWorkflow" class="workflow-form">
			<div class="form-group">
				<label for="name">Workflow Name</label>
				<input id="name" v-model="name" type="text" required class="form-control" placeholder="Daily" />
			</div>

			<div class="form-group">
				<label for="user_code">User Code</label>
				<input id="user_code" v-model="userCode" type="text" required class="form-control" placeholder="com.finmars.local:daily" />
			</div>

			<FmButton type="submit" class="submit-btn">Create</FmButton>
		</form>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
let store = useStore();

let name = ref('');
let userCode = ref('');

// Function to create the new workflow
async function createWorkflow() {
	try {
		// Call your API to create the workflow
		const response = await useApi('workflowTemplate.post', {
			body: {
				name: name.value,
				user_code: userCode.value,
			},
			notifyError: false
		});

		if (response._$error) {
			useNotify({
				type: 'error',
				title: 'Error',
				text: response._$error.error?.details?.errors?.[0]?.detail || 'Failed to create the Workflow Template.'
			});

			throw response._$error;
		}

		// Redirect to the detail edit page after creation
		const createdWorkflowId = response.id;
		router.push(`/${store.realm_code}/${store.space_code}/w/workflow-template/${createdWorkflowId}/`);
	} catch (error) {
		console.error('Error creating workflow:', error);
		// Handle error, e.g., show a notification to the user
	}
}
</script>

<style scoped>
.new-workflow-page {
	padding: 30px;
	max-width: 600px;
	margin: 48px auto; /* Center the form */
	background-color: #f9f9f9;
	border-radius: 10px;
	box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
}

h1 {
	font-size: 1.8rem;
	font-weight: bold;
	margin-bottom: 20px;
	text-align: center;
	color: #333;
}

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

.submit-btn {
	padding: 12px 20px;
	background-color: #007bff;
	color: white;
	font-size: 1rem;
	font-weight: bold;
	border: none;
	border-radius: 5px;
	cursor: pointer;
	transition: background-color 0.3s ease;
	text-align: center;
}

.submit-btn:hover {
	background-color: #0056b3;
}

.submit-btn:focus {
	outline: none;
	box-shadow: 0 0 8px rgba(0, 123, 255, 0.4); /* Focus shadow effect on button */
}
</style>
