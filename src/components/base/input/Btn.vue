<template>
    <button class="p-0.5 leading-none outline-0
    disabled:-opacity--input-disabled-opacity disabled:-text--input-disabled-color">
        <slot>
            <fm-icon v-if="icon" :icon="icon" />
        </slot>
    </button>
</template>

<script setup>
import FmIcon from "../../fm/Icon.vue";

// stores
// props, emits
let props = defineProps({
    icon: String,
})

//# region variables, refs, computed

//# endregion

//# region hooks
//# endregion

// watchers
</script>

<style lang=postcss scoped>

</style>