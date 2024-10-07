<template>
	<div class="relative inline-block">
		<div ref="activator" class="height-100">
			<slot name="btn" :isOpen="isOpen"></slot>
		</div>

		<Teleport :to="attach">
			<transition>
				<div
					v-if="isOpen"
					class="fm_drop inline-block overflow-auto left-0 fixed"
					ref="popup"
					:style="{'min-height': minHeight}"
					v-click-outside="closeOnCo"
				>
					<slot :close="toggle"></slot>
				</div>
			</transition>
		</Teleport>
	</div>
</template>

<script setup>

	const props = defineProps({
		opened: Boolean,
		anchor: {
			type: String,
			default: 'bottom left',
		},
		relativeTo: [String, Node],

		openOnClick: {
			type: Boolean,
			default: true,
		},
		openOnHover: {
			type: Boolean,
			default: false,
		},
		openOnRightClick: {
			type: Boolean,
			default: false,
		},

		disabled: Boolean,
		closeOnClickOutside: {
			type: Boolean,
			default: true,
		},

		attach: {
			type: String,
			default: 'body',
		},

		minHeight: String,
		menuWidth: [Number, String],
		minWidth: [Number, String],

		positionX: Number,
		positionY: Number,
		offsetX: {
			type: Number,
			default: 0
		},
		offsetY: {
			type: Number,
			default: 0
		},
	})

	const emit = defineEmits(['update:opened'])

	let isOpen = ref(false)
	let popup = ref(null) // DOM element
	let activator = ref(null) // DOM element

	let isTop = props.anchor.includes('top')
	let isBot = props.anchor.includes('bottom')
	let isLeft = props.anchor.includes('left')
	let isRight = props.anchor.includes('right')

	onMounted(() => {

		if ( props.openOnHover ) {
			activator.value.addEventListener('mouseover', () => {
				isOpen.value = true
			});
			activator.value.addEventListener('mouseleave', () => {
				isOpen.value = false
			});

		}
		else if (props.openOnRightClick) {

			activator.value.addEventListener('contextmenu', event => {

				event.preventDefault();
				event.stopPropagation();

				isOpen.value = true;

			});

		}
		else if (props.openOnClick) {
			activator.value.addEventListener('click', toggle);
		}

	});

	watch(
		() => props.opened,
		() => {
			if (!props.disabled) isOpen.value = props.opened;
		}
	)

	async function openHandlerBegins() {

		await nextTick()

		if (props.minWidth || props.minWidth === 0) {

			let minWidth = props.minWidth;

			if ( isNaN(props.minWidth) ) {
				minWidth = props.minWidth + 'px';
			}

			popup.value.style['min-width'] = minWidth;

		}

	}


	const isOpenHandler = async () => {

		if ( !isOpen.value ) return false;


		document.body.click();

		await openHandlerBegins();

		popup.value.style.position = 'absolute';

		let positionX;
		if (props.positionX) positionX = props.positionX;

		let positionY;
		if (props.positionY) positionY = props.positionY;

		let activatorRect = activator.value.getBoundingClientRect();
		// let popupRect = popup.value.getBoundingClientRect()

        if (!props.minWidth && props.minWidth !== 0) {
            popup.value.style['min-width'] = activatorRect.width + 'px';
        }

		let popupHeight = popup.value.clientHeight;
		let popupWidth = popup.value.clientWidth;

		if (!positionX) {

			if (isLeft) {
				positionX = activatorRect['left'];

			} else {
				positionX = activatorRect['right'];
			}

		}

		if (!positionY) {
			positionY = isTop ? activatorRect['top'] : activatorRect['bottom'];
		}

		if (props.offsetX) {
			positionX = positionX + props.offsetX;
		}

		if (props.offsetY) {
			positionY = positionY + props.offsetY;
		}

		//#region Prevents popup from creeping out of window
		const windowHeight = document.body.clientHeight;
		const windowWidth = document.body.clientWidth;

		if (popupHeight > windowHeight) popupHeight = windowHeight;

		if (positionX + popupWidth > windowWidth) {
			popup.value.style.right = '0';
			popup.value.style.left = "auto";

		} else {
			popup.value.style.left = positionX + 'px';
			popup.value.style.right = "";
		}

		if (positionY + popupHeight > windowHeight) {
			popup.value.style.bottom = '0';
			popup.value.style.top = "auto";

		}
		else {
			popup.value.style.top = positionY + 'px';
			popup.value.style.bottom = "";
		}

	};

	watch(isOpen, isOpenHandler)

	function toggle() {

		if (props.disabled) return;

		isOpen.value = !isOpen.value;

		emit('update:opened', isOpen.value);

	}

	let closeOnCo = {
		handler: function (event) {
			// needed when fm_drop attached to another element (e.g. body) instead of activator
			if ( ( popup.value && popup.value.contains(event.target) ) || activator.value.contains(event.target) ) return;

			isOpen.value = false;
			emit('update:opened', isOpen.value);

		},
		events: ['click', 'contextmenu'],
		isActive: props.closeOnClickOutside
	};

</script>

<style lang="postcss" scoped>
.fm_drop {
	z-index: 55;
	box-shadow: 0 3px 11px 3px hsl(0deg 0% 60% / 40%);
	border-radius: 5px;
	background: var(--base-backgroundColor);
}
</style>
