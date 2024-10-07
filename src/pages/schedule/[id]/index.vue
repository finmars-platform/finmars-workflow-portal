<template>

	<h1>Schedule Detail page</h1>

	{{ schedule.user_code }}

</template>

<script setup>

definePageMeta({
	middleware: 'auth',
})

const route = useRoute()

let schedule = ref({})

async function init() {
	schedule = await useApi('schedule.get', {params: {id: route.params.id}})
}

await init()

</script>

<style lang="postcss" scoped>
</style>
