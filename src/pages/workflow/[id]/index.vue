<template>
	<fm-loader v-if="isLoading" class="w-8"/>
	<template v-else>
		<WorkflowV1 @update="getWorkflow" :workflow="workflow" v-if="workflow?.workflow_version === 1"/>
		<WorkflowV2 @update="getWorkflow" :workflow="workflow" v-else-if="workflow?.workflow_version === 2"/>
		<div v-else>Not support workflow</div>
	</template>
</template>

<script setup>
import {ref} from 'vue';
import WorkflowV1 from "~/components/Workflow/WorkflowV1.vue";
import WorkflowV2 from "~/components/Workflow/WorkflowV2.vue";

const route = useRoute();

definePageMeta({
	middleware: "auth",
});

const isLoading = ref(false)
const workflow = ref({});

async function getWorkflow() {
	isLoading.value = true;

	workflow.value = await useApi('workflow.get', {params: {id: route.params.id}});

	isLoading.value = false;
}

getWorkflow();

</script>

<style lang="postcss" scoped>

</style>
