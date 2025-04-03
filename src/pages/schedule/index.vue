<template>
	<div class="schedule-page">
		<div class="pb-4">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div class="table-container">
			<div v-if="isLoading" class="w-full min-h-40 flex items-center justify-center">
				<FmProgressCircular :size="34" indeterminate/>
			</div>
			<div
				v-else-if="!schedules.length"
				class="flex w-full min-h-36 justify-center items-center"
			>
				<span>No data available!</span>
			</div>
			<table v-else class="schedule-table">
				<thead>
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>User Code</th>
					<th>Crontab</th>
					<th>Is Enabled</th>
					<th>Notes</th>
					<th>Next Run At</th>
					<th>Last Run At</th>
				</tr>
				</thead>
				<tbody>
				<tr v-for="item in schedules" :key="item.id" :style="{ opacity: !item.enabled ? 0.5 : 1 }" @click="generateLink(item.id)">
					<td>{{ item.id }}</td>
					<td>{{ item.name }}</td>
					<td>{{ item.user_code }}</td>
					<td>{{ formatCrontab(item.crontab_line) }}</td>
					<td><span v-if="item.enabled">Yes</span> <span v-if="!item.enabled">No</span></td>
					<td>{{ item.notes }}</td>
					<td><span :title="'Server Time: ' + item.next_run_at"> {{ formatDate(item.next_run_at) }} </span>
					</td>
					<td><span :title="'Server Time: ' + item.last_run_at"> {{ formatDate(item.last_run_at) }} </span>
					</td>
				</tr>
				</tbody>
			</table>
			<FmPagination
				:with-info="true"
				:total-items="count"
				:items-per-page="pageSize"
				:model-value="currentPage"
				@update:modelValue="handlePageChange"
			/>
		</div>

		<FmButton type="primary" rounded @click="generateLink('new')">Create New</FmButton>

	</div>
</template>

<script setup>
import {FmButton, FmProgressCircular, FmBreadcrumbs, FmPagination} from "@finmars/ui";

definePageMeta({
	middleware: "auth",
});

const route = useRoute();
const router = useRouter();

const store = useStore();
store.init();

const crumbs = ref([
	{ title: 'Schedule', path: 'schedule' }
]);

const isLoading = ref(false);
const schedules = ref([]);
const count = ref(0);
const pageSize = ref(8);
const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);

async function getSchedules(newPage = 1) {
	isLoading.value = true;
	router.push({ query: { ...route.query, page: currentPage.value } });

	const payload = {
		page_size: pageSize.value,
		page: newPage,
	};
	const res = await useApi('scheduleList.get',{
		filters: payload,
		query: { page: newPage }
	});

	if (res && res._$error) {
		useNotify({
			type: 'error',
			title: res._$error.message || res._$error.error.details
		});
	} else {
		count.value = res.count || res.length;
		schedules.value = res.results;
	}
	isLoading.value = false;
}

const handlePageChange = (newPage) => {
	currentPage.value = newPage;
	getSchedules(currentPage.value);
};

function generateLink(pathEnd) {
	usePrefixedRouterPush(
		router,
		route,
		`/schedule/${pathEnd}`
	);
}

function formatDate(dateString) {
	const options = {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'};
	return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatCrontab(crontab) {
	return crontab;
}

async function init() {
	await getSchedules();
}

init();

</script>

<style scoped lang="postcss">
.schedule-page {
	padding: 20px;
}

.table-container {
	width: 100%;
	overflow-x: auto;
}

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

.schedule-table th {
	background-color: #f5f5f5;
	font-weight: bold;
}

.schedule-table tr:nth-child(even) {
	background-color: #f9f9f9;
}

.schedule-table tr:hover {
	background-color: #f1f1f1;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
	.schedule-table th, .schedule-table td {
		padding: 8px;
		font-size: 0.9rem;
	}
}

</style>
