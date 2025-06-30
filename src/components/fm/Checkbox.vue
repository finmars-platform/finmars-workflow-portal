<template>
	<label class="checkbox_label flex aic" :class="{disabled}">
		<input
			type="checkbox"
			:checked="modelValue"
			:disabled="disabled"
			@change="disabled || emit('update:modelValue', !modelValue)"
		/>

		<span class="check inline-block relative align-middle rounded mr-2.5 cursor-pointer bg-white" :class="{ disabled: disabled }">
			<FmIcon
				icon="check"
				:size="1"
				class="mark block absolute top-px left-px opacity-0 text-base"
			/>
		</span>

		<span v-if="label">{{ label }}</span>
	</label>
</template>

<script setup>

	let props = defineProps({
		modelValue: Boolean,
		disabled: Boolean,
		type: String,
		label: String,
		tooltip: String,
	})
	let emit = defineEmits({
		'update:modelValue': (value) => true,
	})
</script>

<style lang="postcss" scoped>
.checkbox_label:not(.disabled) {
	cursor: pointer;
}
.checkbox_label {
	color: var(--secondary-color);
}
input[type='radio'],
input[type='checkbox'] {
	display: none;
}
input[type='radio']:checked + .check > .mark,
input[type='checkbox']:checked + .check > .mark {
	opacity: 1;
}
input[type='checkbox']:checked + .check {
	background: var(--primary-color);
	border: none;
}
input[type='checkbox']:checked + .check.disabled {
	background: #747474;
	color: #fff;
}
.check {
	min-width: 18px;
	height: 18px;
	border: 1px solid #b3b3b3;
}

.check .mark {
	transition: 0.3s;
	color: var(--base-backgroundColor);
}
.check.disabled {
	cursor: default;
}


</style>
