<template>

	<div class="panel_wrap">
		<fm-horizontal-panel height="65">
			<template #leftActions>
				<slot name="action" />
			</template>

			<template #rightActions>
				<fm-loader v-if="loader" class="w-8"/>
				<FmButton
					class="text-capitalize FmButton"
					@click="$emit('refresh')"
				>
					<FmIcon icon="refresh" />
					<span>refresh</span>
				</FmButton>
			</template>
		</fm-horizontal-panel>
	</div>

</template>

<script setup>

defineProps({
	loader: Boolean,
})
</script>
<style lang="postcss" scoped>
	.panel_wrap {
		height: 65px;
	}
	.FmButton {
		background: var(--base-backgroundColor);
		color: var(--primary-color) !important;
	}
	.refresh-btn :deep(.icon)  {
		color: var(--primary-color) !important;
	}
</style>
