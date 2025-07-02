<template>
	<div v-if="store.user && allowedItems" class="default">
		<TheHeader />
		<div class="main">
			<FmNavigationPortal
				v-if="!$route?.meta?.isHideSidebar"
				alternativeLink="RouterLink"
				:base="config?.public?.apiURL"
				:route="$route"
				:isVue="true"
				:items="allowedItems"
			/>
			<div class="content scrollable">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup>

	import { useNavigationRoutes } from '~/composables/useNavigationRoutes';

	import useStore from "~/stores/useStore";
	import FmNavbar from "~/components/fm/Navbar.vue";
	import TheHeader from "~/components/TheHeader.vue";
	import {useToggleDarkMode} from "~/composables/useUtils";

	const store = useStore();
  	// const evAttrsStore = useEvAttributesStore();
	const config = useRuntimeConfig();

	const { init } = useNavigationRoutes();

	await store.init();

	let notLoadingMember = ref(true)
	const allowedItems = ref(null);

	watch(
		() => store.user?.data.dark_mode,
		() => {
			useToggleDarkMode(store.user.data.dark_mode)
		}
	)

	watchEffect(async (onCleanup) => {
		if (store.isUrlValid) {
			onCleanup(() => {})

			notLoadingMember.value = false

			await Promise.all([
				store.getMe(),
				// store.fetchEcosystemDefaults(),
				// evAttrsStore.fetchSystemAttributes(),
			]);

			notLoadingMember.value = true
		}
	})


	watch(
		() => store.member,
		async () => {

			console.log("here??")

			const result = await init();
			if (result) {
				allowedItems.value = result;
			}
		}
	);

</script>
<style lang="postcss" scoped>
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
