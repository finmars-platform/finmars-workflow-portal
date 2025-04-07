<template>
	<div class="workflow-template-page">
		<div class="pb-4">
			<FmBreadcrumbs :crumbs="crumbs" />
		</div>
		<div class="table-container">
			<div v-if="isLoading" class="w-full min-h-40 flex items-center justify-center">
				<FmProgressCircular :size="34" indeterminate/>
			</div>
			<div
				v-else-if="!workflowTemplates.length"
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
					<th>Notes</th>
					<th>Created</th>
					<th></th>
				</tr>
				</thead>
				<tbody>
				<tr v-for="item in workflowTemplates" :key="item.id" @click="generateLink(item.id)">
					<td>{{ item.id }}</td>
					<td>{{ item.name }}</td>
					<td>{{ item.user_code }}</td>
					<td>{{ item.notes }}</td>
					<td>{{ formatDate(item.created_at) }}</td>
					<td>
						<div class="action">
							<FmIconButton size="small" icon="mdi-content-copy" @click.stop="openCopyModal({data: item.data, notes: item.notes, name: item.name})" />
							<FmIconButton size="small" icon="mdi-delete" @click.stop="openDeleteWorkflowTemplate(item)" />
						</div>
					</td>
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

		<FmButton @click="generateLink('new')" rounded class="mt-2">Create New</FmButton>

		<EditTemplateModal
			v-if="editTemplate.data && editTemplate.name"
			:data="editTemplate.data"
			:notes="editTemplate.notes"
			:name="editTemplate.name"
			:userCode="''"
			@close="editTemplate = {}"
			@update="getWorkflowTemplates"
		/>

		<FmConfirm
			title="Delete Workflow template"
			:isOpen="isShowConfirm"
			@closeModal="isShowConfirm = false"
			@okModal="deleteWorkflowTemplate"
		>
			<span>Are you sure you want to delete {{deletableWorkflowTemplate.name}} ?</span>
		</FmConfirm>
	</div>
</template>

<script setup>
import {FmPagination, FmBreadcrumbs, FmProgressCircular, FmButton} from '@finmars/ui';
import EditTemplateModal from "~/components/modals/EditTemplateModal.vue";
import FmConfirm from "~/components/fm/Confirm.vue";

const route = useRoute();
const router = useRouter();

const store = useStore();

store.init();
definePageMeta({
	middleware: "auth",
});

const crumbs = ref([
	{ title: 'Workflow template', path: 'workflow-template' }
]);

const isLoading = ref(false);
const isShowConfirm = ref(false);
const workflowTemplates = ref([]);
const editTemplate = ref({})
const count = ref(0);
const pageSize = ref(8);
const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);

const deletableWorkflowTemplate = ref({});

const handlePageChange = (newPage) => {
	currentPage.value = newPage;
	getWorkflowTemplates(currentPage.value)
};

function generateLink(pathEnd) {
	usePrefixedRouterPush(
		router,
		route,
		`/workflow-template/${pathEnd}`
	);
}

async function getWorkflowTemplates(newPage = 1) {
	router.push({ query: { ...route.query, page: currentPage.value } });
	isLoading.value = true;

	const payload = {
		page_size: pageSize.value,
		page: newPage,
	};
	const res = await useApi('workflowTemplateList.get', {
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
		workflowTemplates.value = res.results;
	}
	isLoading.value = false;
}

function formatDate(dateString) {
	const options = {year: 'numeric', month: 'short', day: 'numeric'};
	return new Date(dateString).toLocaleDateString(undefined, options);
}

async function openCopyModal({data, notes, name}) {
	editTemplate.value = {
		data,
		notes,
		name,
	}
}

function openDeleteWorkflowTemplate(item) {
	deletableWorkflowTemplate.value = item;
	isShowConfirm.value = true;
}

async function deleteWorkflowTemplate() {
	currentPage.value = 1
	try {
		const res = await useApi('workflowTemplate.delete', {
			params: {id: deletableWorkflowTemplate.value.id}
		});
		if (res && res._$error) {
			useNotify({
				type: 'error',
				title: res._$error.message || res._$error.error.details
			});
		} else {
			useNotify({
				type: 'success',
				text: 'Workflow Template deleted successfully!'
			});
			await getWorkflowTemplates();
		}
	} catch (e) {
		useNotify({
			type: 'error',
			title: 'Error',
			text: 'Failed to delete the workflow template.'
		});
	} finally {
		isShowConfirm.value = false;
		deletableWorkflowTemplate.value = {};
	}
}

async function init() {
	await getWorkflowTemplates();
}

init();

</script>

<style scoped lang="postcss">

/* Container for the page */
.workflow-template-page {
	padding: 0 20px 20px 20px;
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
	font-weight: bold;
}

.workflow-table tr:hover {
	cursor: pointer;
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

.action {
	display: flex;
	gap: 4px;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
	.workflow-table th, .workflow-table td {
		padding: 8px;
		font-size: 0.9rem;
	}
}

</style>
