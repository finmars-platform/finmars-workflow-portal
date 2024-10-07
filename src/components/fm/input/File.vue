<template>
	<fm-base-input
		model-value=" "
		:label="label"
		class="cursor-pointer"
		left-icon="file_upload"
		@click="fileInput.click()"
	>

		<input ref="fileInput" type="file" @change="addFile">
		<div class="h-full leading-10">
			{{ fileName }}
		</div>

		<template #sideItems></template>
	</fm-base-input>
</template>

<script setup>

	let props = defineProps({
		label: String,
	})

	let fileName = ref('...')

	let fileInput = ref(null);

	function addFile( e ) {
		let file = e.target.files[0]

		if ( !file ) return false

		fileName.value = file.name.length > 20 ? file.name.slice(0, 25) + '...' : file.name
	}
</script>

<style lang="postcss" scoped>
</style>
