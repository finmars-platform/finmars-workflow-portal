<template>
	<div></div>
</template>

<script setup>



</script>

<style lang="postcss" scoped>

header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 52px;
	background: var(--base-backgroundColor);
	padding: 0 30px;
	border-bottom: 1px solid var(--light-border-color);
	font-weight: 500;
	color: var(--border-color);
	text-transform: initial;
}

.header_text_btn,
.fm_btn.text.header_text_btn {
	font-weight: 500;
	text-transform: initial;
	padding: 0 12px;
	color: var(--primary-color);
}

.user-profile {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.user-profile .user-profile-picture {
	width: 32px;
	margin-right: 8px;
}


</style>
