<template>
	<div class="workflow-template-page">

		<!-- Page Title -->
		<h1 class="page-title">Workflow Template Page</h1>

		<!-- Workflow Templates Table -->
		<div class="table-container">
			<table class="workflow-table">
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
				<tr v-for="item in workflowTemplates" :key="item.id">
					<td>
						<NuxtLink :to="useGetNuxtLink(`/workflow-template/${item.id}`, $route.params)"
								  class="table-link">
							{{ item.id }}
						</NuxtLink>
					</td>
					<td>{{ item.name }}</td>
					<td>{{ item.user_code }}</td>
					<td>{{ item.notes }}</td>
					<td>{{ formatDate(item.created_at) }}</td>
					<td>
						<div class="action">
							<FmIconButton size="normal" icon="mdi-content-copy" @click.stop="openCopyModal({data: item.data, notes: item.notes, name: item.name})" />
							<FmIconButton size="normal" icon="mdi-delete" @click.stop="deleteWorkflowTemplate(item.id)" />
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

		<fm-btn @click="goToNewWorkflowPage">Create New</fm-btn>

		<EditTemplateModal
			v-if="editTemplate"
			:data="editTemplate.data"
			:notes="editTemplate.notes"
			:name="editTemplate.name"
			:userCode="''"
			@close="editTemplate = null"
			@update="getWorkflowTemplates"
		/>
	</div>
</template>

<script setup>
import { FmPagination, FmIconButton } from '@finmars/ui';
import {useGetNuxtLink} from "~/composables/useMeta";
import {onMounted, ref} from "vue";
import EditTemplateModal from "~/components/modals/EditTemplateModal.vue";

const route = useRoute();
const router = useRouter();

const store = useStore();

store.init();
definePageMeta({
	middleware: "auth",
});

let workflowTemplates = ref([]);
const editTemplate = ref(null)
const count = ref(0);
const pageSize = ref(8);
const currentPage = ref(route.query.page ? parseInt(route.query.page) : 1);

async function getWorkflowTemplates(newPage = 1) {
	router.push({ query: { ...route.query, page: currentPage.value } });
	const payload = {
		page_size: pageSize.value,
		page: newPage,
	};
	const data = await useApi('workflowTemplateList.get', {
		filters: payload,
		query: { page: newPage }
	});

	count.value = data.count;
	workflowTemplates.value = data['results'];
}

const handlePageChange = (newPage) => {
	currentPage.value = newPage;
	getWorkflowTemplates()
};

function formatDate(dateString) {
	// Format date in a more readable way
	const options = {year: 'numeric', month: 'short', day: 'numeric'};
	return new Date(dateString).toLocaleDateString(undefined, options);
}


function goToNewWorkflowPage() {
	router.push(`/${store.realm_code}/${store.space_code}/w/workflow-template/new`);
}

async function openCopyModal({data, notes, name}) {
	editTemplate.value = {
		data,
		notes,
		name,
	}
}

async function deleteWorkflowTemplate(templateId) {

	const isConfirm = await useConfirm({
		text: `Are you sure you want to delete Workflow Template?`,
	})
	if (!isConfirm) return false

	currentPage.value = 1

	const res = await useApi('workflowTemplate.delete', {
		params: {id: templateId}
	});

	if (res?._$error) {
		useNotify({
			type: 'error',
			title: 'Error',
			text: 'Failed to delete the Workflow Template.'
		});

		return;
	}
	useNotify({
		type: 'success',
		title: 'Success',
		text: 'Workflow Template deleted successfully!'
	});

	await getWorkflowTemplates();
}


onMounted(async () => {
	await getWorkflowTemplates();
});

</script>

<style scoped lang="postcss">

/* Container for the page */
.workflow-template-page {
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
	background-color: #f5f5f5;
	font-weight: bold;
}

.workflow-table tr:nth-child(even) {
	background-color: #f9f9f9;
}

.workflow-table tr:hover {
	background-color: #f1f1f1;
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
