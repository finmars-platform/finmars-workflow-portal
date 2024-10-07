<template>

	<div class="panel_wrap">
		<fm-horizontal-panel height="65">
			<template #leftActions>
				<slot name="action" />
			</template>

			<template #rightActions>
				<fm-loader v-if="loader" class="w-8"/>
				<fm-btn
					class="text-capitalize fm-btn"
					@click="$emit('refresh')"
				>
					<fm-icon icon="refresh" />
					<span>refresh</span>
				</fm-btn>
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
	.fm-btn {
		background: var(--base-backgroundColor);
		color: var(--primary-color) !important;
	}
	.refresh-btn :deep(.icon)  {
		color: var(--primary-color) !important;
	}
</style>
