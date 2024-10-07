<template>
	<div>
		<h1>Workflow Template Page</h1>

		<table>
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
			<tr v-for="item in workflowTemplates">
				<td>
					<NuxtLink :to="useGetNuxtLink(`/workflow-template/${item.id}`, $route.params)" class="sidemenu-btn">
						{{ item.id }}
					</NuxtLink>
				</td>
				<td>{{ item.name }}</td>
				<td>{{ item.user_code }}</td>
				<td>{{ item.status }}</td>
				<td>{{ item.created }}</td>
			</tr>
			</tbody>
		</table>


	</div>
</template>

<script setup>

import {useGetNuxtLink} from "~/composables/useMeta";
import {onMounted, ref} from "vue";

let store = useStore()
store.init();
definePageMeta({
	middleware: "auth",
});

let workflowTemplates = ref([]);

async function getWorkflowTemplates() {
	const data = await useApi('workflowTemplateList.get')
	workflowTemplates.value = data['results']
	console.log('workflowTemplates', workflowTemplates);
}

async function init() {
	await getWorkflowTemplates()
}

onMounted(async () => {
	await init()
})

</script>

<style scoped lang="postcss">

</style>
