<template>
	<div class="schedule-edit-page">
		<h1>Edit Schedule</h1>

		<!-- Schedule Form -->
		<form @submit.prevent="saveSchedule" class="schedule-form">
			<table class="schedule-info-table">
				<tr>
					<th>ID</th>
					<td>{{ schedule.id }}</td>
				</tr>
				<tr>
					<th>User Code</th>
					<td><input v-model="schedule.user_code" type="text" required /></td>
				</tr>
				<tr>
					<th>Name</th>
					<td><input v-model="schedule.name" type="text" required /></td>
				</tr>
				<tr>
					<th>Crontab Line</th>
					<td><input v-model="schedule.crontab_line" type="text" required /></td>
				</tr>
				<tr>
					<th>Created</th>
					<td>{{ formatDate(schedule.created) }}</td>
				</tr>
				<tr>
					<th>Modified</th>
					<td>{{ formatDate(schedule.modified) }}</td>
				</tr>
				<tr>
					<th>Owner</th>
					<td>{{ schedule.owner_username }}</td>
				</tr>
				<tr>
					<th>Manager</th>
					<td>
						<select v-model="schedule.is_manager">
							<option :value="true">Yes</option>
							<option :value="false">No</option>
						</select>
					</td>
				</tr>
				<tr>
					<th>Enabled</th>
					<td>
						<select v-model="schedule.enabled">
							<option :value="true">Yes</option>
							<option :value="false">No</option>
						</select>
					</td>
				</tr>
			</table>

			<!-- Actions -->
			<div class="action-buttons">
				<fm-btn type="submit" class="save-btn">Save</fm-btn>
				<fm-btn type="button" @click="deleteSchedule" class="delete-btn">Delete</fm-btn>
			</div>
		</form>
	</div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';


const route = useRoute();
const router = useRouter();

let schedule = ref({});

// Fetch the schedule data
async function getSchedule() {
	const response = await useApi('schedule.get', {params: {id: route.params.id}});
	schedule.value = response;
}

// Save the updated schedule
async function saveSchedule() {
	try {
		await useApi('schedule.put', {
			body: schedule.value,
			params: {id: route.params.id}
		});
		useNotify({
			type: 'success',
			title: 'Success',
			text: 'Schedule updated successfully!'
		});
	} catch (error) {
		useNotify({
			type: 'error',
			title: 'Error',
			text: 'Failed to update the schedule.'
		});
	}
}

// Delete the schedule
async function deleteSchedule() {
	try {
		await useApi('schedule.delete', {
			params: {id: route.params.id}
		});
		useNotify({
			type: 'success',
			title: 'Success',
			text: 'Schedule deleted successfully!'
		});
		router.push('/schedules'); // Redirect after deletion
	} catch (error) {
		useNotify({
			type: 'error',
			title: 'Error',
			text: 'Failed to delete the schedule.'
		});
	}
}

// Format the date to a more readable format
function formatDate(dateString) {
	const options = {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'};
	return new Date(dateString).toLocaleDateString(undefined, options);
}

// Fetch the schedule when the page loads
onMounted(() => {
	getSchedule();
});
</script>

<style scoped lang="postcss">
.schedule-edit-page {
	padding: 20px;
}

h1 {
	font-size: 2rem;
	font-weight: bold;
	margin-bottom: 20px;
}

.schedule-info-table {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 20px;
}

.schedule-info-table th, .schedule-info-table td {
	padding: 10px;
	border-bottom: 1px solid #ddd;
	text-align: left;
}

.schedule-info-table th {
	background-color: #f5f5f5;
	width: 150px;
	font-weight: bold;
}

input, select {
	width: 100%;
	padding: 8px;
	border: 1px solid #ccc;
	border-radius: 4px;
}

.action-buttons {
	margin-top: 20px;
}

.save-btn {
	background-color: #007bff;
	color: white;
	padding: 10px 20px;
	margin-right: 10px;
}

.delete-btn {
	background-color: #ff4d4f;
	color: white;
	padding: 10px 20px;
}
</style>
