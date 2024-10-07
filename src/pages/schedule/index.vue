<template>
	<div>
		<h1>Schedule Page</h1>

		<table>
			<thead>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>User Code</th>
				<th>Crontab</th>
				<th>Created</th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="item in schedules">
				<td>
					<NuxtLink :to="useGetNuxtLink(`/schedule/${item.id}`, $route.params)" class="sidemenu-btn">
						{{ item.id }}
					</NuxtLink>
				</td>
				<td>{{ item.name }}</td>
				<td>{{ item.user_code }}</td>
				<td>{{ item.crontab_line }}</td>
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


const data = await useApi('scheduleList.get')
const schedules = data['results']
console.log('schedules', schedules);

</script>

<style scoped lang="postcss">

</style>
