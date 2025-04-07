<template>
	<teleport to="body">
		<div
			class="modal-overlay"
			v-if="isOpen"
		>
			<div class="modal-content">
				<!-- Header -->
				<span class="modal-title">{{ title }}</span>

				<!-- Content with slot-->
				<div class="modal-body">
					<slot></slot>
				</div>

				<!-- Footer -->
				<div class="modal-footer">
					<FmButton
						type="secondary"
						rounded
						@click="handleClose"
					>
						Cancel
					</FmButton>
					<FmButton
						type="primary"
						rounded
						@click="handleOk"
					>
						Ok
					</FmButton>
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
	background-color: var(--surface-container-high);
	padding: 1.5rem;
	border-radius: 0.5rem;
	box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
	max-width: 32rem; /* roughly Tailwind's max-w-lg */
	width: 100%;
}

.modal-title {
	font-size: 1.25rem;
	font-weight: 600;
}

.modal-body {
	width: 100%;
}

.modal-footer {
	width: 100%;
	display: flex;
	justify-content: space-between;
	gap: 1rem;
}
</style>
