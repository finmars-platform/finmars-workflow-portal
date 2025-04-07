<template>
	<FmNavigation
		:items="items"
		alternativeLink="RouterLink"
		:base="config?.public?.apiURL"
		:route="$route"
	/>
</template>

<script setup>

const config = useRuntimeConfig();
const store = useStore();

const items = ref([
	{
		key: 'home',
		label: 'Home',
		icon: 'mdi-home-account',
		action: undefined,
		to: `/${store.realm_code}/${store.space_code}${usePathPrefix}/home`,
		href: '',
		style: {},
		classes: 'first-side-nav'
	},
	{
		key: 'schedule',
		label: 'Schedule',
		icon: 'mdi-book-clock',
		action: undefined,
		to: `/${store.realm_code}/${store.space_code}${usePathPrefix}/schedule`,
		href: '',
		style: {},
	},
	{
		key: 'workflow',
		label: 'Workflow',
		icon: 'mdi-lan',
		action: undefined,
		to: `/${store.realm_code}/${store.space_code}${usePathPrefix}/workflow`,
		href: '',
		style: {},
	},
	{
		key: 'workflow-templates',
		label: 'Workflow Templates',
		icon: 'mdi-sitemap',
		action: undefined,
		to: `/${store.realm_code}/${store.space_code}${usePathPrefix}/workflow-template`,
		href: '',
		style: {},
	},
	{
		key: 'documentation',
		label: 'Documentation',
		icon: 'mdi-file-document-multiple',
		action: undefined,
		to: `/${store.realm_code}/workflow/static/documentation/index.html`,
		href: '',
		style: {},
	},
	{
		key: 'api-documentation',
		label: 'API Documentation',
		icon: 'mdi-api',
		action: undefined,
		to: `/${store.realm_code}/${store.space_code}/workflow/docs/api`,
		href: '',
		style: {},
	},
	{
		key: 'logs',
		label: 'Logs',
		icon: 'mdi-math-log',
		action: undefined,
		to: `/${store.realm_code}/${store.space_code}/workflow/api/log`,
		href: '',
		style: {},
	}
])

</script>

<style lang="postcss">
.first-side-nav {
	@apply mt-[16px] block;
}
</style>
