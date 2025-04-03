<template>
	<div v-if="notLoadingMember && store.user" class="default">
		<TheHeader/>
		<div class="main">
			<TheNavigation v-if="!$route.meta.isHideSidebar"/>
			<div class="content scrollable">
				<div class="refresh-wrap">
					<FmIconButton size="normal" icon="mdi-refresh" @click="refreshStorage()"/>
				</div>
				<slot/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { FmIconButton } from '@finmars/ui';
import useStore from "~/stores/useStore";
import TheHeader from "~/components/TheHeader.vue";
import TheNavigation from "~/components/TheNavigation.vue";

const store = useStore();

await store.init();

let notLoadingMember = ref(true)

watch(
	() => store.user?.data.dark_mode,
	() => {
		useToggleDarkMode(store.user.data.dark_mode)
	}
)

watchEffect(async (onCleanup) => {
	if (store.isUrlValid) {
		onCleanup(() => {
		})

		notLoadingMember.value = false

		await Promise.all([
			store.getMe(),
			store.fetchEcosystemDefaults(),
			// evAttrsStore.fetchSystemAttributes(),
		]);

		notLoadingMember.value = true
	}
})

async function refreshStorage() {
	await useApi('refreshStorage.get');

	useNotify({
		type: 'success',
		title: 'Success',
		text: 'Storage refreshed'
	});
}
</script>
<style lang="postcss" scoped>
.refresh-wrap{
	display: flex;
	align-items: center;
	justify-content: flex-end;
	width: 100%;
	padding-top: 15px;
	padding-right: 20px;
}
.main {
	display: flex;
	background: var(--base-backgroundColor);
}

.content {
	flex-grow: 1;
	height: calc(100vh - 80px);
	overflow: auto;
}
</style>
