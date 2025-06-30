<template>
	<div class="workflow-page">

		<!-- Page Title -->
		<h1 class="page-title">Workflow Page</h1>

		<!-- Workflows Table -->
		<div class="table-container">
			<table class="workflow-table">
				<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>User Code</th>
					<th>Status</th>
					<th>Created</th>
				</tr>
				</thead>
				<tbody>
				<tr v-for="item in workflows" :key="item.id">
					<td>
						<NuxtLink :to="useGetNuxtLink(`/workflow/${item.id}`, $route.params)" class="table-link">
							{{ item.id }}
						</NuxtLink>
					</td>
					<td>{{ item.name }}</td>
					<td>{{ item.user_code }}</td>
					<td :class="getStatusClass(item.status)">
						<StatusBadge :status="item.status" />
					</td>
					<td>{{ formatDate(item.created_at) }}</td>
				</tr>
				</tbody>
			</table>
		</div>

		<div class="flex mb-4">
			<FmButton
				class="button"
				:type="currentPage === 1 ? 'disabled' : 'text'"
				v-if="totalPages !== 1"
				@click="openPreviousPage"
			>
				Previous
			</FmButton>

			<div class="flex">
				<div v-for="page in totalPages" :key="page">
					<FmButton
						v-if="totalPages > currentPage"
						:type="currentPage === page && 'filled'"
						class="button"
						@click="openPage(page)"
					>
						{{ page }}
					</FmButton>
				</div>
			</div>
			<FmButton
				v-if="currentPage < totalPages"
				type="text"
				class="button"
				@click="openNextPage"
			>
				Next
			</FmButton>
		</div>
	</div>
</template>

<script setup>

import {useGetNuxtLink} from "~/composables/useMeta";
import {onMounted, ref} from "vue";
import StatusBadge from '~/components/StatusBadge.vue';
import usePagination from "~/composables/usePagination"; // Import the component

let store = useStore();
store.init();
definePageMeta({
	middleware: "auth",
});

let workflows = ref([]);
const {currentPage, totalPages, pageSize} = usePagination();

function openNextPage() {
	if (currentPage.value >= totalPages.value) return

	currentPage.value += 1

	getWorkflows()
}

function openPreviousPage() {
	if (currentPage.value <= 1) return

	currentPage.value -= 1

	getWorkflows()
}

function openPage(value) {
	if (currentPage.value === value) return
	currentPage.value = value

	getWorkflows()
}

async function getWorkflows() {
	const data = await useApi('workflowListLight.get', {
		filters: {page_size: pageSize.value, page: currentPage.value}
	});

	workflows.value = data['results'];
	totalPages.value = Math.ceil(data.count / pageSize.value);
	console.log('workflows', workflows);
	console.log('totalPages', totalPages);
}

function formatDate(dateString) {
	// Format date in a more readable way
	const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
	return new Date(dateString).toLocaleDateString(undefined, options);
}

function getStatusClass(status) {
	// Return CSS class based on the status
	switch (status) {
		case 'active': return 'status-active';
		case 'inactive': return 'status-inactive';
		default: return 'status-default';
	}
}

onMounted(async () => {
	await getWorkflows();
});

</script>

<style scoped lang="postcss">

/* Container for the page */
.workflow-page {
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
.workflow-table {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 20px;
}

.workflow-table th, .workflow-table td {
	padding: 12px;
	border: 1px solid #ddd;
	text-align: left;
}

.workflow-table th {
	//background-color: #f5f5f5;
	font-weight: bold;
}

/* Status column styling */
.status-active {
	color: green;
	font-weight: bold;
}

.status-inactive {
	color: red;
	font-weight: bold;
}

.status-default {
	color: gray;
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
	.workflow-table th, .workflow-table td {
		padding: 8px;
		font-size: 0.9rem;
	}
}

</style>
