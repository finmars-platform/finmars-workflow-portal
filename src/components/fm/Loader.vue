<template>
	<div
		class="loader_container"
		:class="{'position_center absolute flex justify-center items-center h-full w-full top-0 left-o': positionCenter}">

		<div
			class="
bg-white relative rounded-full text-center flex
items-center justify-center shadow-[0_0_10px_rgba(0,0,0,1)]
			"
			:style="{
				width: `${size}px`,
				height: `${size}px`
			}"
		>

			<img class="w-9/12 h-9/12" src="/img/sphere.png" alt="">

			<div
				class="loader_elem rounded-full absolute w-full h-full"
				:style="
					`border-top-color: ${colorRef};
					border-right-color: ${colorRef}`
				"
			></div>

		</div>

	</div>

</template>

<script setup>

	let props = defineProps({
		size: {
			type: Number,
			default: 30
		},
		border: {
			type: String,
			default: '3'
		},
		type: {
			type: String,
			default: 'primary'
		},
		positionCenter: Boolean,
	})

  const brightColors = [
    '#FF5733', '#FFC300', '#36D7B7', '#3399FF', '#FF33FF', // Original colors
    '#FF6666', '#FF9900', '#66FF66', '#33CCFF', '#FF66CC', // Additional colors
    '#FF9966', '#FFCC00', '#00FF00', '#66CCFF', '#FF66FF',
    '#FFCCCC', '#FFFF00', '#00FF99', '#99CCFF', '#CC33FF',
    '#FFCC99', '#FFFF33', '#33FF33', '#66CCCC', '#CC66FF',
    '#FF9999', '#FFFF66', '#66FFCC', '#99A8FF', '#FF99FF',
    '#FF0000', '#FFCC66', // More colors
    '#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
    '#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC',
    '#FFA07A', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
    '#FFA500', '#FFCC7F', '#00FFBF', '#99BBFF', '#FF0099',
    '#FFB347', '#FFDD00', '#7FFF00', '#3399FF', '#FF1493',
    '#FF6347', '#FFE303', '#32CD32', '#66CCFF', '#C71585',
    '#FF4500', '#FFD700', // Even more colors
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
    '#FFA07A', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
    '#FFA500', '#FFCC7F', '#00FFBF', '#99BBFF', '#FF0099',
    '#FFB347', '#FFDD00', '#7FFF00', '#3399FF', '#FF1493',
    '#FF6347', '#FFE303', '#32CD32', '#66CCFF', '#C71585',
    '#FF4500', '#FFD700', // More and more colors
    '#A020F0', '#FF69B4', '#9932CC', '#DA70D6', '#FFB6C1',
    '#800080', '#FF00FF', '#FF1493', '#FF69B4', '#C71585',
    '#9400D3', '#D8BFD8', '#FFA07A', '#FF6EB4', '#FF82AB',
    '#800080', '#EE82EE', '#FF66CC', '#FF81C0', '#FF00FF',
    '#800080', '#DA70D6', '#FF1493', '#FF69B4', '#C71585',
    '#9932CC', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3',
    '#9932CC', '#8B008B', '#800080', '#FF00FF', '#C71585',
    '#FFA500', '#FFD700', '#00FF7F', '#6699FF', '#FF0099',
    '#FF8533', '#FFB600', '#66FF33', '#3399CC', '#FF00FF',
    '#FF8080', '#FFCC33', '#33FF66', '#66A3FF', '#FF00CC'
  ];

  let colorInterval;
  const colorRef = ref('');

  onUnmounted(() => {
    clearInterval(colorInterval);
  })

  function rotateColor() {

    return setInterval(() => {

      const randomIndex = Math.floor(Math.random() * brightColors.length);

      colorRef.value = brightColors[randomIndex];

    }, 2*1000);

  }

  colorInterval = rotateColor();

</script>

<style lang="postcss" scoped>

.loader_holder img {
	animation: rotateCounterClockwise 20s linear infinite; /* Adjust duration as needed */
}

@keyframes rotateCounterClockwise {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(-360deg);
	}
}

.loader_elem {
	border: .2em solid transparent;
	border-top-color: #F05A22;
	transition: border-top-color 2s linear, border-right-color 2s linear;
	animation: 1s rotateClockwise linear infinite;
}

.loader_elem:before {
	content: '';
	display: block;
	width: inherit;
	height: inherit;
	position: absolute;
	top: -.2em;
	left: -.2em;
	border-radius: 50%;
	opacity: .2;
}

@keyframes rotateClockwise {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

</style>
