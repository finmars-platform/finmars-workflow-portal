<template>
	<BaseModal :title="settings.title" v-model="settings.isOpen">
		<div class="content">
			<div class="pb-4">{{ settings.text }}</div>

			<FmTextField
				v-if="settings.check"
				v-model="checkedValue"
				label="Value"
				no-indicator-button
			/>
		</div>

		<template #footer>
			<div class="flex flex-row justify-between">
				<FmButton type="text" @click="cancel()">CANCEL</FmButton>

				<FmButton type="filled" @click="ok()">OK</FmButton>
			</div>
		</template>
	</BaseModal>
</template>

<script setup>

	import {FmTextField} from "@finmars/ui"

	defineProps({
		title: String,
		controls: Boolean
	})

	let checkedValue = ref('')
	let settings = useState('confirmSettings', () => {
		return {
			isOpen: false,
			title: 'Confirm',
			text: 'Are you sure?',
			result: null
		}
	})

	function cancel() {
		settings.value.result = false
		settings.value.isOpen = false
	}
	function ok() {
		if ( settings.value.check ) {
			if ( settings.value.check != checkedValue.value ) {
				useNotify({
					type: 'warn',
					title: 'Value not confirm',
				})
				return false
			}
		}
		settings.value.result = true
		settings.value.isOpen = false

		checkedValue.value = ''
	}
</script>

<style lang="postcss" scoped>
	.content {
		max-width: 400px;
	}
</style>
