<template>
	<div class="flex flex-col h-screen p-3 bg-pageBackground w-40 overflow-y-auto navbar min-w-40">
		<NuxtLink :to='`${usePathPrefix}/profile/realm`'>
			<img :src="logoPath" class="sidenav-logo h-10" alt="Finmars logo"/>
		</NuxtLink>
		<div class="space-y-3">
			<div class="flex-1">
				<ul class="pt-2 pb-4 space-y-1 text-sm">
					<li
						v-for="linkItem of navLinks"
						class="rounded-sm"
					>
						<NuxtLink :to="linkItem.link" class="flex items-center p-2 space-x-3 hover:bg-stateActiveBackground rounded-full">
							<span class="text-secondary font-semibold text-left text-xs leading-loose tracking-normal">{{ linkItem.name }}</span>
						</NuxtLink>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script setup>

let store = useStore()

const navLinks = [
	{name: 'Home', link: `/${store.realm_code}/${store.space_code}/w/home`},
	{name: 'Workflow Templates', link: `/${store.realm_code}/${store.space_code}/w/workflow-template`},
	{name: 'Workflows', link: `/${store.realm_code}/${store.space_code}/w/workflow`},
	{name: 'Schedules', link: `/${store.realm_code}/${store.space_code}/w/schedule`},
	{name: 'Documentation', link: `/${store.realm_code}/workflow/static/documentation/index.html`},
	{name: 'API Documentation', link: `/${store.realm_code}/${store.space_code}/workflow/docs/api/`},
	{name: 'Logs', link: `/${store.realm_code}/${store.space_code}/workflow/api/log/`}
];
const logoPath = computed(() => {
	return store.darkModeActive ? '/img/logo-dark.png' : '/img/logo.png';
});

</script>

<style lang="postcss" scoped>
.navbar {
	border-right: 1px solid var(--border-color);
}
.sidenav-logo {
	margin: 0 auto;
	max-width: 140px;
	width: 140px;
}
</style>
