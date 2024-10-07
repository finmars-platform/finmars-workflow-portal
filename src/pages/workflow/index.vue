<template>
	<div>
		<h1>Workflow Page</h1>

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
			<tr v-for="item in workflows">
				<td>
					<NuxtLink :to="useGetNuxtLink(`/workflow/${item.id}`, $route.params)" class="sidemenu-btn">
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

let store = useStore()
store.init();
definePageMeta({
	middleware: "auth",
});


const data = await useApi('workflowListLight.get')
const workflows = data['results']
console.log('workflows', workflows);

</script>

<style scoped lang="postcss">

</style>
