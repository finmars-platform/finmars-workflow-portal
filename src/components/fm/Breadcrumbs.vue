<template>
	<div class="fm_breadcrumbs flex items-center">
		<template
			v-for="(item, index) in items"
			:key="index"
		>
			<NuxtLink
				v-if="!item.disabled"
				class="fm_breadcrumbs_items pb-px"
				:to="item.to"
			>
				{{ item.text }}
			</NuxtLink>
			<div v-else>{{ item.text }}</div>

			<FmIcon v-if="last != index" class="py-0 px-3 cursor-default text-lg" icon="east" />
		</template>
	</div>
</template>

<script setup>

	let props = defineProps({
		items: Array
	})

	let last = ref(0)

	if ( props.items ) setLast()

	watch( () => props.items, () => setLast())

	function setLast() {
		last.value = props.items?.length - 1
	}
</script>

<style lang="postcss" scoped>
.fm_breadcrumbs {
	color: var(--secondary-color);
}

.fm_breadcrumbs_items {
	border-bottom: 1px solid var(--border-color);
	transition: 0.3s;
}

.fm_breadcrumbs_items:hover {
	color: var(--secondary-color);
	border-color: var(--secondary-color);
}

</style>
