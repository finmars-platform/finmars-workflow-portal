<template>
	<div class="flex flex-col h-screen p-3 bg-pageBackground w-40 overflow-y-auto navbar min-w-40">
		<NuxtLink :to='`/${store.realm_code}/${store.space_code}/w/home`'>
			<img :src="logoPath" class="sidenav-logo h-10" alt="Finmars logo"/>
		</NuxtLink>
		<div class="space-y-3">
			<div class="flex-1">
				<ul class="pt-2 pb-4 space-y-1 text-sm">
					<li
						v-for="linkItem of navLinks"
						class="rounded-sm"
					>
						<template v-if="linkItem.isExternal">
							<a :href="linkItem.link" target="_blank" rel="noopener noreferrer"
							   class="flex items-center p-2 space-x-3 hover:bg-stateActiveBackground rounded-full">
								<span class="text-secondary font-semibold text-left text-xs leading-loose tracking-normal">{{ linkItem.name }}</span>
							</a>
						</template>
						<template v-else>
							<NuxtLink :to="linkItem.link" class="flex items-center p-2 space-x-3 hover:bg-stateActiveBackground rounded-full">
								<span class="text-secondary font-semibold text-left text-xs leading-loose tracking-normal">{{ linkItem.name }}</span>
							</NuxtLink>
						</template>
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
	{name: 'Documentation', link: `/${store.realm_code}/workflow/static/documentation/index.html`, isExternal: true},
	{name: 'API Documentation', link: `/${store.realm_code}/${store.space_code}/workflow/docs/api/`, isExternal: true},
	{name: 'Logs', link: `/${store.realm_code}/${store.space_code}/workflow/api/log/`, isExternal: true}
];
const logoPath = computed(() => {
	return store.darkModeActive ? '/img/logo-dark.png' : '/img/logo.png';
});

</script>

<style lang="postcss" scoped>
.navbar {
	border-right: 1px solid var(--border-color);
	min-width: 160px;
	padding: 1rem;
	display: flex;
	transition: all 0.3s ease;
}

/* Logo container */
.logo-container {
	display: flex;
	justify-content: center;
	margin-bottom: 1rem;
}

/* Logo image */
.sidenav-logo {
	max-width: 140px;
	width: 140px;
	transition: all 0.3s ease;
}

/* Hover effects for links */
li {
	list-style-type: none;
}

li:hover {
	opacity: .8;
}

ul {
	padding: 0;
}

li a {
	color: #000;
	transition: color 0.2s ease;
}

li a:hover {
	color: #000;
	opacity: .9;
}
</style>
