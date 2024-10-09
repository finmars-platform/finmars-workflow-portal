<template>
	<!-- Dynamic class binding for the status badge -->
	<span :class="getStatusClass(status)" class="status-badge">
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	status: {
		type: String,
		required: true,
		default: 'no_data'
	},
});

// Function to determine the class based on status
function getStatusClass(status) {
	switch (status) {
		case 'init': return 'badge-init';
		case 'progress': return 'badge-progress';
		case 'wait': return 'badge-wait';
		case 'success': return 'badge-success';
		case 'error': return 'badge-error';
		case 'timeout': return 'badge-timeout';
		case 'canceled': return 'badge-canceled';
		default: return 'badge-default';
	}
}

</script>

<style scoped lang="postcss">
/* Status badge base styling */
.status-badge {
	padding: 5px 10px;
	border-radius: 12px;
	font-size: 0.9rem;
	color: white;
	display: inline-block;
	text-transform: capitalize; /* Make status text look nice */
}

/* Different status styles */
.badge-init {
	background-color: #6c757d; /* Gray for init */
}

.badge-progress {
	background-color: #17a2b8; /* Blue for progress */
}

.badge-wait {
	background-color: #ffc107; /* Yellow for wait */
}

.badge-success {
	background-color: #28a745; /* Green for success */
}

.badge-error {
	background-color: #dc3545; /* Red for error */
}

.badge-timeout {
	background-color: #fd7e14; /* Orange for timeout */
}

.badge-canceled {
	background-color: #343a40; /* Dark for canceled */
}

/* Fallback style for any other status */
.badge-default {
	background-color: #6c757d; /* Default gray */
}
</style>
