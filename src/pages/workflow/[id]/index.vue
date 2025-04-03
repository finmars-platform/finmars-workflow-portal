<template>
	<div class="p-2">
		<div class="pb-4">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<div v-if="isLoading" class="w-full min-h-40 flex items-center justify-center">
			<FmProgressCircular :size="34" indeterminate/>
		</div>
		<div v-else>
			<WorkflowV1 @update="getWorkflow" :workflow="workflow" v-if="workflow?.workflow_version === 1"/>
			<WorkflowV2 @update="getWorkflow" :workflow="workflow" v-else-if="workflow?.workflow_version === 2"/>
			<div v-else>Not support workflow</div>
		</div>
	</div>
</template>

<script setup>
import {FmBreadcrumbs, FmProgressCircular} from "@finmars/ui";
import WorkflowV1 from "~/components/Workflow/WorkflowV1.vue";
import WorkflowV2 from "~/components/Workflow/WorkflowV2.vue";

definePageMeta({
	middleware: "auth",
});

const route = useRoute();
const router = useRouter();

const store = useStore();
store.init();

const crumbs = ref([
	{ title: 'Workflow', path: 'workflow' },
	{ title: 'Edit workflow', path: 'edit' }
]);

const isLoading = ref(false);
const workflow = ref({});

const handleCrumbs = (newCrumbs, newPath) => {
	router.push(`/${store.realm_code}/${store.space_code}/w` + newPath);
};

async function getWorkflow() {
	isLoading.value = true;
	const res = await useApi('workflow.get', {params: {id: route.params.id}});

	if (res && res._$error) {
		useNotify({
			type: 'error',
			title: res._$error.message || res._$error.error.details
		});
	} else {
		workflow.value = res;
	}

	isLoading.value = false;
}

getWorkflow();

</script>

<style lang="postcss" scoped>

</style>
