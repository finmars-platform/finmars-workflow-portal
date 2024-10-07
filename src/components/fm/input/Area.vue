<template>

	<div class="base-input relative rounded" :class="{disabled}" tabindex="-1">

		<div v-if="label">

			<div class="bi_label mb-1 text-base">
				{{ label }}
			</div>

		</div>

		<div class="bi_wrap" :class="{ readonly }">

			<textarea
				class="bg-cardBackground block w-full h-full p-4 border-none resize-none"
				:rows="calcRow"
				:cols="$attrs.cols"
				:value="modelValue"
				:disabled="disabled"
				@input="$emit('update:modelValue', $event.target.value)"
			></textarea>

		</div>

	</div>
</template>

<script setup>
	let props = defineProps({
		modelValue: [String, Number],
		label: String,
		auto: {
			type: Boolean,
			default: true,
		},
		disabled: Boolean,
	})
	defineEmits(['update:modelValue'])

	const attrs = useAttrs()

	const calcRow = computed(() => {

		if (attrs.rows) {
			return attrs.rows;
		}

		if ( !props.auto ) return 2;

		const lineBreaksNum = props.modelValue.split("\n").length;

		return Math.max(lineBreaksNum, 2);

	})

</script>

<style lang="postcss" scoped>

.base-input:focus-within:not(.disabled) .bi_wrap {
	border: 1px solid #333;
}

.base-input:hover:not(.disabled) .bi_side_items {
	display: flex;
}

.base-input.disabled .bi_label {
	color: #e0e0e0;
	cursor: default;
}

.bi_label {
	padding: 0 3px;
}

.bi_wrap {
	border: 1px solid #b3b3b3;
	border-radius: 4px;
	transition: border 0.3s;
}
</style>
