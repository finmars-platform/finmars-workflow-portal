<template>
	<div class="workflow-table-container">
		<div class="pb-4">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div v-if="isLoading" class="w-full min-h-40 flex items-center justify-center">
			<FmProgressCircular :size="34" indeterminate />
		</div>
		<div
			v-else-if="!definitions.length"
			class="flex w-full min-h-36 justify-center items-center"
		>
			<span>No data available!</span>
		</div>
		<table v-else class="workflow-table">
			<thead>
			<tr>
				<th>Name</th>
				<th>User Code</th>
				<th>Is Manager</th>
				<th>Actions</th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="item in definitions" :key="item.user_code">
				<td>{{ item.name }}</td>
				<td>{{ item.user_code }}</td>
				<td>{{ item.is_manager ? 'Yes' : 'No' }}</td>
				<td>
					<FmButton type="primary" rounded @click="generateLink(item, 'run')">Run</FmButton>
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
</template>

<script setup>
import {FmBreadcrumbs, FmButton, FmPagination, FmProgressCircular} from '@finmars/ui';

definePageMeta({
	middleware: "auth",
});

const route = useRoute();
const router = useRouter();

const store = useStore();
store.init();

const crumbs = ref([
	{ title: 'Home', path: 'home' }
]);

const isLoading = ref(false);
const definitions = ref([]);
const count = ref(0);
const pageSize = ref(8);
const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);

function generateLink(item, linkEnd = '') {
	store.setWorkflowItem(item);
	usePrefixedRouterPush(router, route, `/home/${linkEnd}`);
}

const handlePageChange = (newPage) => {
	currentPage.value = newPage;
	init(currentPage.value);
};

async function init(newPage = 1) {
	isLoading.value = true;
	router.push({ query: { ...route.query, page: currentPage.value } });

	const payload = {
		page_size: pageSize.value,
		page: newPage,
	};

	const res = await useApi('definitionList.get',{
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
		definitions.value = res;
	}
	isLoading.value = false;
}

init();

</script>

<style scoped lang="postcss">
.workflow-table-container {
	margin: 0 20px 20px 20px;
}

.workflow-table {
	width: 100%;
	border-collapse: collapse;
}

.workflow-table th, .workflow-table td {
	padding: 12px;
	text-align: left;
	border-bottom: 1px solid #ddd;
}

.workflow-table th {
	background-color: #f0f0f0;
	font-weight: bold;
}

.workflow-table tr:nth-child(even) {
	background-color: #f9f9f9;
}

.workflow-table tr:hover {
	background-color: #f1f1f1;
}
</style>
