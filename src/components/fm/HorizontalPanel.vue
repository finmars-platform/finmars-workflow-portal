<template>
	<div class="fm_container flex items-center justify-between box-border"
			 :style="{height: panelHeight}">
		<div class="flex items-center">
			<slot name="leftActions" />
		</div>

		<div class="flex items-center">
			<slot name="rightActions" />
		</div>
	</div>
</template>

<script setup>
	let props = defineProps({
		height: {
			type: String,
			default: '50px'
		}
	})

	let panelHeight = computed(() => {

		if (!isNaN(props.height)) {
			return props.height + 'px';
		}

		return props.height;

	});

</script>

<style lang="postcss" scoped>
	.fm_container {
		background: var(--base-backgroundColor);
		border-bottom: 1px solid var(--table-border-color);
		padding: 15px 30px
	}
</style>
