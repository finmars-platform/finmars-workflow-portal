<template>
	<div class="schedule-page">

		<!-- Page Title -->
		<h1 class="page-title">Schedule Page</h1>

		<!-- Schedules Table -->
		<div class="table-container">
			<table class="schedule-table">
				<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>User Code</th>
					<th>Crontab</th>
					<th>Owner</th>
					<th>Is Enabled</th>
					<th>Notes</th>
					<th>Next Run At</th>
					<th>Last Run At</th>
				</tr>
				</thead>
				<tbody>
				<tr v-for="item in schedules" :key="item.id" :style="{ opacity: !item.enabled ? 0.5 : 1 }">
					<td>
						<NuxtLink :to="useGetNuxtLink(`/schedule/${item.id}`, $route.params)" class="table-link">
							{{ item.id }}
						</NuxtLink>
					</td>
					<td>{{ item.name }}</td>
					<td>{{ item.user_code }}</td>
					<td>{{ formatCrontab(item.crontab_line) }}</td>
					<td>{{ item.owner_username }}</td>
					<td><span v-if="item.enabled">Yes</span> <span v-if="!item.enabled">No</span></td>
					<td>{{ item.notes }}</td>
					<td><span :title="'Server Time: ' + item.next_run_at"> {{formatDate(item.next_run_at)}} </span></td>
					<td><span :title="'Server Time: ' + item.last_run_at"> {{formatDate(item.last_run_at)}} </span></td>
				</tr>
				</tbody>
			</table>
		</div>

		<FmButton @click="goToNewSchedulePage">Create New</FmButton>

	</div>
</template>

<script setup>

import {useGetNuxtLink} from "~/composables/useMeta";
import {onMounted, ref} from "vue";

const router = useRouter();
let store = useStore();
store.init();
definePageMeta({
	middleware: "auth",
});

let schedules = ref([]);

async function getSchedules() {
	const data = await useApi('scheduleList.get');
	schedules.value = data['results'];
	console.log('schedules', schedules);
}

function goToNewSchedulePage() {
	router.push(`/${store.realm_code}/${store.space_code}/w/schedule/new`);
}


function formatDate(dateString) {
	// Format the created date in a more readable way
	const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
	return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatCrontab(crontab) {
	// If needed, you can format the crontab line here to make it more readable
	return crontab;
}

onMounted(async () => {
	await getSchedules();
});

</script>

<style scoped lang="postcss">

/* Container for the page */
.schedule-page {
	padding: 20px;
}

/* Page title styling */
.page-title {
	font-size: 2rem;
	font-weight: bold;
	margin-bottom: 20px;
	text-align: center;
	color: var(--primary-color);
}

/* Table container for responsiveness */
.table-container {
	width: 100%;
	overflow-x: auto;
}

/* Table styling */
.schedule-table {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 20px;
}

.schedule-table th, .schedule-table td {
	padding: 12px;
	border: 1px solid #ddd;
	text-align: left;
}


/* Links in table */
.table-link {
	color: var(--primary-color);
	text-decoration: none;
	font-weight: bold;
}

.table-link:hover {
	text-decoration: underline;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
	.schedule-table th, .schedule-table td {
		padding: 8px;
		font-size: 0.9rem;
	}
}

</style>
