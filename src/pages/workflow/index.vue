<template>
	<div class="workflow-page">

		<!-- Page Title -->
		<h1 class="page-title">Workflow Page</h1>

		<div style="margin-bottom: 16px;">

			<!-- Filters Row -->
			<div class="filter-row flex items-center mb-4 space-x-4">
				<!-- User Code Filter -->
				<div>
					<label for="user-code-filter">User Code:</label>
					<input
						id="user-code-filter"
						v-model="filterUserCode"
						@input="onFilterChange"
						placeholder="e.g. space00000.com.finmars.local"
						class="input"
					/>
				</div>

				<!-- Status Filter -->
				<div>
					<label for="status-filter">Status:</label>
					<select
						id="status-filter"
						v-model="filterStatus"
						@change="onFilterChange"
						class="select"
					>
						<option value="">All</option>
						<option value="init">Init</option>
						<option value="progress">Progress</option>
						<option value="wait">Wait</option>
						<option value="success">Success</option>
						<option value="timeout">Timeout</option>
						<option value="canceled">Canceled</option>
						<option value="error">Error</option>
					</select>
				</div>

				<!-- Date Range Filter -->
				<div>
					<label for="date-after">Created After:</label>
					<input
						id="date-after"
						type="date"
						v-model="filterDateAfter"
						@change="onFilterChange"
						class="input"
					/>
				</div>
				<div>
					<label for="date-before">Created Before:</label>
					<input
						id="date-before"
						type="date"
						v-model="filterDateBefore"
						@change="onFilterChange"
						class="input"
					/>
				</div>
			</div>


		</div>

		<!-- Workflows Table -->
		<div class="table-container">
			<table class="workflow-table">
				<thead>
				<tr>
					<th>ID</th>
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
					<td>{{ item.user_code }}</td>
					<td :class="getStatusClass(item.status)">
						<StatusBadge :status="item.status" />
					</td>
					<td>{{ formatDate(item.created_at) }}</td>
				</tr>
				</tbody>
			</table>
		</div>

		<FmPagination
			v-model="currentPage"
			:with-info="true"
			:items-per-page="pageSize"
			:total-items="totalItems"
			:locals="{ of: 'of', entities: 'workflows', page: 'Page' }"
		/>
	</div>
</template>

<script setup>

import {useGetNuxtLink} from "~/composables/useMeta";
import { ref, computed } from "vue";
import StatusBadge from '~/components/StatusBadge.vue';
import { FmPagination } from "@finmars/ui";

const route = useRoute()
const routeQuery = computed(() => route.query)
const router = useRouter()

const currentPage = ref(parseInt(route.query.page) || 1)
const pageSize = ref(8)
const filterStatus = ref(route.query.status || '')
const filterUserCode = ref(route.query.user_code || '')
const filterDateAfter = ref(route.query.created_at_after  || '')
const filterDateBefore= ref(route.query.created_at_before || '')

let store = useStore();
store.init();
definePageMeta({
	middleware: "auth",
});

const { data: apiResult } = await useAsyncData(
	`workflow-${route.query}`,
	() =>
		useApi("workflowListLight.get", {
			filters: {
				page_size: pageSize.value,
				page: currentPage.value,

				// only send if non-empty
				...(filterStatus.value && { status: filterStatus.value }),
				...(filterUserCode.value && {
					user_code: filterUserCode.value,
				}),
				...(filterDateAfter.value && {
					created_at_after: filterDateAfter.value,
				}),
				...(filterDateBefore.value && {
					created_at_before: filterDateBefore.value,
				}),
			},
		}),
	{
		watch: [ routeQuery ],
	}
)
const workflows = computed(() => apiResult.value?.results || [])
const totalItems = computed(() => apiResult.value?.count || 0)

function onFilterChange() {
	// **Always** set the ref’s .value, not the ref itself
	currentPage.value = 1
	updateUrl()
}

function updateUrl() {
	router.replace({
		query: {
			...route.query,
			page:  currentPage.value,
			status: filterStatus.value || undefined,
			user_code: filterUserCode.value || undefined
		}
	})
}

watch(currentPage, () => {
	updateUrl();
})

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
