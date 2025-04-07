<template>
	<div class="workflow-page">
		<div class="pb-4">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div class="table-container">
			<div v-if="isLoading" class="w-full min-h-40 flex items-center justify-center">
				<FmProgressCircular :size="34" indeterminate/>
			</div>
			<div
				v-else-if="!workflows.length"
				class="flex w-full min-h-36 justify-center items-center"
			>
				<span>No data available!</span>
			</div>
			<table v-else class="workflow-table">
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
				<tr v-for="item in workflows" :key="item.id" @click="generateLink(item.id)">
					<td>{{ item.id }}</td>
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
		<FmPagination
			:with-info="true"
			:total-items="count"
			:items-per-page="pageSize"
			:model-value="currentPage"
			@update:modelValue="handlePageChange"
		/>
	</div>
</template>

<script setup>
import {FmBreadcrumbs, FmPagination,  FmProgressCircular} from '@finmars/ui';
import StatusBadge from '~/components/StatusBadge.vue';

definePageMeta({
	middleware: "auth",
});

const route = useRoute();
const router = useRouter();

const store = useStore();
store.init();

const crumbs = ref([
	{ title: 'Workflow', path: 'workflow' }
]);

const isLoading = ref(false);
const workflows = ref([]);
const count = ref(0);
const pageSize = ref(8);
const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);

async function getWorkflows(newPage = 1) {
	router.push({ query: { ...route.query, page: currentPage.value } });
	isLoading.value = true;

	const payload = {
		page_size: pageSize.value,
		page: newPage,
	};

	const res = await useApi('workflowListLight.get', {
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
		workflows.value = res.results;
	}
	isLoading.value = false;
}

const handlePageChange = (newPage) => {
	currentPage.value = newPage;
	getWorkflows(currentPage.value);
};

function generateLink(pathEnd) {
	usePrefixedRouterPush(
		router,
		route,
		`/workflow/${pathEnd}`
	);
}

function formatDate(dateString) {
	const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
	return new Date(dateString).toLocaleDateString(undefined, options);
}

function getStatusClass(status) {
	switch (status) {
		case 'active': return 'status-active';
		case 'inactive': return 'status-inactive';
		default: return 'status-default';
	}
}

async function init() {
	await getWorkflows();
}

init();

</script>

<style scoped lang="postcss">
.workflow-page {
	padding: 0 20px 20px 20px;
}
.table-container {
	width: 100%;
	overflow-x: auto;
}

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
	font-weight: bold;
}

.workflow-table tr:hover {
	cursor: pointer;
}

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

/* Responsive design for smaller screens */
@media (max-width: 768px) {
	.workflow-table th, .workflow-table td {
		padding: 8px;
		font-size: 0.9rem;
	}
}

</style>
