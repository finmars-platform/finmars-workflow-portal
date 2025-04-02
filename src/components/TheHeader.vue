<template>
	<div>
		<FmHeader
			:notifications="noti"
			:isDark="toggleIsDark"
			:currentWorkspaceName="store?.current?.name"
			:workspaces="store?.masterUsers"
			:documentationUrl="getDocumentationLink()"
			:apiReferenceUrl="`${apiUrl}/${store.realm_code}/${store.space_code}/docs/api/v1/`"
			:logoutUrl="`${apiUrl}/logout`"
			:logo="logoPath"
			:avatar="store?.user?.profile_picture"
			:letters="letters"
			@setTheme="toggleTheme"
			@profile="goToProfile"
			@security="openAccManager"
			@setCurrent="setCurrent"
		/>
	</div>
</template>

<script setup>
const store = useStore();
const config = useRuntimeConfig();
const apiUrl = config.public.apiURL;

const toggleIsDark = ref(store.user?.data?.dark_mode || false)

async function openAccManager() {
	const kc = await uKeycloak();
	kc.accountManagement();
}

const noti = ref(null)

watchEffect(
	() => {
		if (store.isUrlValid) {
			loadNoti()
		}
	}
)

async function loadNoti() {
	let res = await useApi("systemMessages.get", {
		filters: {only_new: true},
	})

	if (res._$error) return false
	noti.value = res.results.filter((item) => !item.is_pinned).slice(0, 3)
}

async function setCurrent(item) {
	window.location.href = '/' + item.realm_code + '/' + item.space_code + '/w/home'
}


async function init() {
	document.body.classList.toggle('dark', store.user.data.dark_mode);
}

const letters = computed(() => {
	return (store?.user?.first_name || store?.user?.username)?.slice(0, 2) || ''
})

function getDocumentationLink() {
	const pieces = window.location.href
		.split('/w/')[1]
		.split('/')
		.map((item) => item.split('-').join(' '))

	return `https://docs.finmars.com/search?term=${pieces.join(' ')}`
}

function toggleTheme(val) {
	if (val !== undefined) {
		toggleIsDark.value = val
		store.user.data.dark_mode = toggleIsDark.value
	} else {
		store.user.data.dark_mode = !store.user.data.dark_mode
	}
	updateUser()
}

function goToProfile() {
	window.location.href = '/v/profile'
}

const updateUser = function () {
	const options = {
		params: {id: store.user.id},
		body: store.user,
	};

	useApi('user.put', options);

};

</script>

<style lang="postcss" scoped></style>
