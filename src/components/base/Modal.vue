<template>
	<teleport to="body">
		<div
			class="modal-overlay"
			v-if="isOpen"
		>
			<div class="modal-content" :style="{ width, height, minHeight }">
				<!-- Header -->
				<span class="modal-title">{{ title }}</span>
				<FmIcon class="close-icon" icon="mdi-window-close" :size="24" @click="handleClose" />

				<!-- Content with slot-->
				<div class="modal-body scrollable">
					<slot></slot>
				</div>

				<!-- Footer -->
				<div class="modal-footer">
					<FmButton type="secondary" rounded @click="handleClose">Cancel</FmButton>
					<FmButton type="primary" rounded @click="handleOk">Ok</FmButton>
				</div>
			</div>
		</div>
	</teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
	title: {
		type: String,
		default: 'Modal',
	},
	isOpen: {
		type: Boolean,
		required: true,
		default: false,
	},
	width: {
		type: String,
		default: '70vw',
	},
	height: {
		type: String,
		default: '70%',
	},
	minHeight: {
		type: String,
		default: '400px',
	},
});

const emit = defineEmits(['closeModal', 'okModal']);

const handleClose = () => {
	emit('closeModal');
};

const handleOk = () => {
	emit('okModal');
};
</script>

<style scoped>
.modal-overlay {
	position: fixed;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(4px);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 50;
}

.modal-content {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	background: var(--surface-container-high);
	padding: 1.5rem;
	border-radius: 0.5rem;
	box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
	width: 100%;
	position: relative;
	max-width: 100%;
}

.modal-title {
	font-size: 1.25rem;
	font-weight: 600;
}

.close-icon {
	position: absolute;
	top: 15px;
	right: 15px;
	cursor: pointer;
}

.modal-body {
	width: 100%;
	height: 100%;
	overflow: auto;
	padding-right: 8px;
}

.modal-footer {
	width: 100%;
	display: flex;
	justify-content: space-between;
	gap: 1rem;
}
</style>
