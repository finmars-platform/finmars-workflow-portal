<template>
	<div v-if="notLoadingMember && store.user" class="wrap">
		<fm-navbar v-if="!$route.meta.isHideSidebar"/>

		<div class="main">
			<the-header />

			<div class="content scrollable">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup>
	import useStore from "~/stores/useStore";
	import FmNavbar from "~/components/fm/Navbar.vue";
	import TheHeader from "~/components/TheHeader.vue";
	import {useToggleDarkMode} from "~/composables/useUtils";

	const store = useStore();
  	// const evAttrsStore = useEvAttributesStore();
	// const config = useRuntimeConfig();

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
			onCleanup(() => {})

			notLoadingMember.value = false

			await Promise.all([
				store.getMe(),
				store.fetchEcosystemDefaults(),
				// evAttrsStore.fetchSystemAttributes(),
			]);

			notLoadingMember.value = true
		}
	})
</script>
<style lang="postcss" scoped>
	.wrap {
		display: flex;
	}
	.main {
		flex-grow: 1;
		//width: calc(100vw - 200px);
		background: var(--base-backgroundColor);
	}
	.content {
		//height: calc(100vh - 52px);
		overflow: auto;
	}
</style>
