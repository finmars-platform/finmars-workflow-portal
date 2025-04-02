<template>
    <Teleport to="body" v-if="modelValue">
        <transition name="fade">
            <div
                v-show="modelValue"
                class="flex justify-center items-center fixed inset-0 z-[80]-text--baseText-color"
                aria-labelledby="modal wrapper"
                :class="{ type }"
            >
                <div
                    class="absolute inset-0 bg-[rgba(0,0,0,0.55)]"
                    aria-labelledby="backdrop"
                    @[backdropClickable]="cancel"
                ></div>

                <div
                    class="modal relative min-w-80 max-w-[90%] -rounded--modal-borderRadius" v-bind="$attrs"
                >
                    <div class="modal_top flex items-center justify-between -bg--modalHeader-backgroundColor -rounded-t--modal-borderRadius
                    ">
                        <!--						<div class="modal_head">{{ title }}</div>

                        <slot name="modalTop" />-->
                        <div class="flex items-center">
                            <div class="-text--modalTitle-fontSize -font--modalTitle-fontFamily -font--modalTitle-fontWeight -leading--modalTitle-lineHeight -tracking---modalTitle-letterSpacing">
                                {{ title }}
                            </div>
                            <slot name="header" />
                        </div>

                    </div>

                    <div class="modal_content -bg--modalContent-backgroundColor">
                        <slot />
                    </div>

                    <div
                        v-if="$slots.footer"
                        class="modal_bottom -bg--modalFooter-backgroundColor -rounded-b--modal-borderRadius"
                    >
                        <slot name="footer" :cancel="cancel" />
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
    import {computed, watch} from "vue";

    // stores
    // props, emits

    let props = defineProps({
        modelValue: Boolean,
        type: {
            type: String,
            default: 'basic',
            validator: (value) => ['basic', 'minimal'].includes(value),
        },
        title: String,
        controls: Object,
        closeOnClickOutside: Boolean,
        closingDisabled: Boolean,
    })

    let emit = defineEmits(['update:modelValue', 'open', 'close']);

    //# region variables, refs, computed
    let backdropClickable = computed(() =>
        props.closeOnClickOutside ? 'click' : false
    )
    //# endregion

    function cancel() {
        if (props.closingDisabled) return;

        emit('update:modelValue', false);
        emit('close');
    }

    // watchers
    watch(
        () => props.modelValue,
        (val) => {

            if (val) {
                document.querySelector('html').style.overflow = 'hidden';
                emit('open');

            } else {
                document.querySelector('html').style.overflow = 'initial';
            }

        },
    )
</script>

<style>
    :root {
        --modalHeader-height: 3rem;
        --modalFooter-height: 3.5rem;
        --modal-backgroundColor: rgb(247, 228, 223);

        --modalHeader-backgroundColor: var(--modal-backgroundColor);
        --modalContent-backgroundColor: var(--modal-backgroundColor);
        --modalFooter-backgroundColor: var(--modal-backgroundColor);

        --modal-borderRadius: 0.25rem;

        --modalTitle-fontSize: 1.5rem;
        --modalTitle-fontFamily: var(--baseText-fontFamily);
        --modalTitle-fontWeight: 400;
        --modalTitle-lineHeight: 2rem;
        --modalTitle-letterSpacing: var(--baseText-letterSpacing);
    }

    body.dark {
        --modal-backgroundColor: rgb(50, 40, 37);

        --modalHeader-backgroundColor: var(--modal-backgroundColor);
        --modalContent-backgroundColor: var(--modal-backgroundColor);
        --modalFooter-backgroundColor: var(--modal-backgroundColor);
    }
</style>

<style lang="scss" scoped>
    .modal-wrap {
        &.minimal {
            .modal_content {
                padding: 0;
            }
        }
    }
    .modal_top {
        height: theme('height.--modalHeader-height');
        padding: 0 20px;
        border-bottom: 1px solid var(--table-border-color);
    }
    .modal_content {
        overflow: auto;
        max-height: calc(90vh - theme('height.--modalHeader-height') - theme('height.--modalFooter-height'));
        height: calc(100% - theme('height.--modalHeader-height') - theme('height.--modalFooter-height'));
        padding: 15px 20px 0;
        min-width: 400px;
    }
    .modal_bottom {
        height: theme('height.--modalFooter-height');
        border-top: 1px solid var(--table-border-color);
        padding: 10px 20px;
    }

    @media screen and (max-width: 768px) {
        .modal {
            width: 100%;
            height: 100%;
            max-height: 100%;
        }
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s;
    }
    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
        opacity: 0;
    }
</style>
