<!-- components/Loader.vue -->
<template>
	<div class="loader">
		<div
			class="rotating-sphere-container flex justify-center items-center rounded-full border-2 border-transparent"
			:style="{
				borderTopColor: color,
				borderRightColor: color
			}"
		>
			<img src="/img/sphere.png" alt="Loading..." class="w-full h-full" />
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';

const color = ref('#F05A22');
const brightColors = [
	'#FF5733', '#FFC300', '#36D7B7', '#3399FF', '#FF33FF',
	'#FF6666', '#FF9900', '#66FF66', '#33CCFF', '#FF66CC',
	'#FF9966', '#FFCC00', '#00FF00', '#66CCFF', '#FF66FF',
	'#FFCCCC', '#FFFF00', '#00FF99', '#99CCFF', '#CC33FF',
	'#FFCC99', '#FFFF33', '#33FF33', '#66CCCC', '#CC66FF',
	'#FF9999', '#FFFF66', '#66FFCC', '#99A8FF', '#FF99FF',
	'#FF0000', '#FFCC66',
	'#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
	'#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC',
	'#FFA07A', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
	'#FFA500', '#FFCC7F', '#00FFBF', '#99BBFF', '#FF0099',
	'#FFB347', '#FFDD00', '#7FFF00', '#3399FF', '#FF1493',
	'#FF6347', '#FFE303', '#32CD32', '#66CCFF', '#C71585',
	'#FF4500', '#FFD700',
	'#A020F0', '#FF69B4', '#9932CC', '#DA70D6', '#FFB6C1',
	'#800080', '#FF00FF', '#FF1493', '#FF69B4', '#C71585',
	'#9400D3', '#D8BFD8', '#FFA07A', '#FF6EB4', '#FF82AB',
	'#800080', '#EE82EE', '#FF66CC', '#FF81C0', '#FF00FF',
	'#800080', '#DA70D6', '#FF1493', '#FF69B4', '#C71585',
	'#9932CC', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3',
	'#9932CC', '#8B008B', '#800080', '#FF00FF', '#C71585',
	'#FFA500', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
	'#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
	'#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC',
];

function getRandomBrightColor() {
	const randomIndex = Math.floor(Math.random() * brightColors.length);
	return brightColors[randomIndex];
}

setInterval(() => {
	color.value = getRandomBrightColor();
}, 2000);
</script>

<style lang="postcss" scoped>
.loader {
	z-index: 9999; /* Ensure the loader is on top */
}
.rotating-sphere-container {
	animation: rotate 2s linear infinite;
}
@keyframes rotate {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
