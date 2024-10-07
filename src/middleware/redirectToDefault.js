export default defineNuxtRouteMiddleware((to, from) => {

	const store = useStore()

	return navigateTo(`${store.realm_code}/${store.space_code}/home`);
})
