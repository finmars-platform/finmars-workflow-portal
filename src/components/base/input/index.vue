<template>
    <!-- `.z-[1]` needed to display `.bi_top` properly when `<base-input>`
    locates inside a relative HTML element
     -->
    <div class="base-input group my-1.5 relative z-[1] -rounded--input-borderRadius -text--input-color transition-[border] duration-300"
        :class="{
            error: errorData,
            disabled: disabled,
            filled: modelValue,
        }"
        tabindex="-1"
        @click="onBiClick"
    >
        <div class="bi_top absolute left-0 z-[-1] flex w-full">

            <!-- height-[5px] makes connection with .base-input borders smoother -->
            <div class="top-left-border flex grow-0 shrink-0 basis-3 w-3 h-[5px] -rounded-tl--input-borderRadius"
            ></div>

            <div v-if="label"
                 class="bi-label flex grow-1 shrink-0 basis-0 relative z-0 -text--inputLabel-fontSize opacity-0 overflow-hidden whitespace-nowrap overflow-ellipsis transition-all ease-linear duration-200"
                 :class="{
                    '-opacity--input-disabled': disabled,
                    '-text--error-color': errorData && !disabled,
                 }"
            >
                {{ label }}
            </div>

            <!-- height-[5px] makes connection with .base-input borders smoother -->
            <div class="top-right-border flex grow-0 shrink-[3] basis-full h-[5px] -rounded-tr--input-borderRadius"></div>
        </div>

        <div class="bi-wrap -p--input-padding border-solid -border--input-borderWidth border-t-transparent -border-x--input-borderColor -border-b--input-borderColor -rounded--input-borderRadius"
             :class="{
                '--border-r--error-color': errorData && !disabled,
                '--border-b--error-color': errorData && !disabled,
                '--border-l--error-color': errorData && !disabled,
             }"
        >

            <div class="flex items-center w-full -h--input-height pl-2">

                <div class="input-button-wrap leading-none">
                    <base-input-btn
                        v-if="leftIcon"
                        :icon="leftIcon"
                        :disabled="disabled"
                        @click.stop="emit('leftButtonClick')"
                    />
                </div>

                <div
                    class="bi-main flex grow-0 shrink basis-full h-full min-w-0"
                    :class="{
                        'pl-0.5': !$slots.left
                    }"
                >
                    <slot>
                        <input
                            ref="mainInput"
                            :type="type"
                            :placeholder="placeholder || label"
                            :value="modelValue"
                            :readonly="readonly"
                            :disabled="disabled"
                            @input="$emit('update:modelValue', $event.target.value)"
                            @focus.stop="$emit('onFocus')"
                            @blur="$emit('onBlur')"
                            class="w-full h-[inherit] bg-inherit outline-0 focus:placeholder:opacity-0"
                        />
                    </slot>
                </div>

                <div
                    class="side-items hidden items-center"
                    :class="{
                        'empty': !$slots.right,
                    }"
                    @click.stop=""
                >
                    <slot name="right"></slot>
                </div>

                <div
                    v-if="errorData"
                    class="w-6 flex items-center -text--error-color"
                >
                    <fm-icon
                        icon="info"
                        v-tooltip="{ content: errorData.longMessage, theme: 'error-tooltip' }"
                    />
                </div>

                <div v-else-if="tooltip"
                     class="w-6 hidden items-center group-hover:flex">
                    <fm-icon
                        icon="info_outlined"
                        v-tooltip="tooltip"
                    />
                </div>

                <div class="mr-2.5">
                    <slot name="rightPart"></slot>
                </div>
            </div>
        </div>

        <div
            v-if="errorData"
            class="bottom-text pt-1 px-4 -text--inputBottomText-fontSize -text--error-color">
                {{ errorData.message }}
        </div>
    </div>
</template>

<script setup>
    import {ref, watch} from "vue";
    import BaseInputBtn from "./Btn.vue";
    import FmIcon from "../../fm/Icon.vue";

    // stores
    // props, emits
    let props = defineProps({
        modelValue: [String, Number],
        type: String,
        label: String,
        placeholder: String,
        readonly: Boolean,
        disabled: Boolean,
        required: Boolean,
        leftIcon: String,
        tooltip: String,
        // error: [String, Array]
        errorData: Object,
    })

    let emit = defineEmits([
        'update:modelValue',
        'leftButtonClick',
        'update:errorData',
        'onBlur',
        'onFocus',
    ])

    //# region variables, refs, computed
    let mainInput = ref(null)

    defineExpose({
        mainInput,
    })
    //# endregion

    //# region hooks
    //# endregion

    // watchers
    watch(
        () => props.modelValue,
        () => {
            if (props.errorData && props.errorData.code === 30 && props.modelValue)
                emit('update:errorData', null)
        }
    )

    if (props.required) {
        watch(
            () => (props.errorData ? props.errorData.validate : false),
            (newVal) => {
                if (newVal) {
                    const error = props.modelValue
                        ? null
                        : { message: 'Field should not be null' }
                    emit('update:errorData', error)
                }
            }
        )
    }

    function onBiClick() {
        if (props.disabled) return;
        if (mainInput.value) mainInput.value.focus();
    }

</script>

<style>
    :root {
        --input-height: 2.5rem;

        --input-borderWidth: 0.05rem;
        --input-thick-borderWidth: 0.125rem;

        --input-borderStyle: solid;
        --input-borderColor: var(--border-color);
        --input-border: var(--input-borderWidth) var(--input-borderStyle) var(--input-borderColor);

        --input-padding: calc(var(--input-thick-borderWidth) - var(--input-borderWidth));

        --input-borderRadius: 0.25rem;

        --input-color: var(--baseText-color);
        --inputLabel-fontSize: 0.75rem;
        --inputBottomText-fontSize: 0.75rem;

        --input-focus-borderWidth: var(--input-thick-borderWidth);
        --input-focus-borderColor: var(--primary-color);
        --input-focus-borderStyle: var(--input-borderStyle);
        --input-focus-border: var(--input-focus-borderWidth) var(--input-focus-borderStyle) var(--input-focus-borderColor);
        --input-focus-padding: 0; /* prevents movement of elements when width of borders changes */

        --input-error-borderColor: var(--error-color);
        --input-error-borderStyle: var(--input-borderStyle);

        --input-disabled-opacity: var(--disabled-opacity);
        --input-disabled-color: var(--baseText-color);
        /* TODO: variable --input-disabled-borderColor */
    }

    body.dark {

        --input-borderColor: var(--border-color);
        --input-border: var(--input-borderWidth) var(--input-borderStyle) var(--input-borderColor);

        --input-padding: calc(var(--input-thick-borderWidth) - var(--input-borderWidth));

        --input-color: var(--baseText-color);

        --input-focus-borderWidth: var(--input-thick-borderWidth);
        --input-focus-borderColor: var(--primary-color);
        --input-focus-borderStyle: var(--input-borderStyle);
        --input-focus-border: var(--input-focus-borderWidth) var(--input-focus-borderStyle) var(--input-focus-borderColor);

        --input-error-borderColor: var(--error-color);
        --input-error-borderStyle: var(--input-borderStyle);

        --input-disabled-opacity: var(--disabled-opacity);
        --input-disabled-color: var(--baseText-color);

    }
</style>

<style lang="postcss" scoped>

    /* TODO: get rid of mixin */
    @define-mixin show-label {
        top: -8px;
        flex-basis: auto;
        padding: 0 0.5rem;
        font-size: theme('fontSize.--inputLabel-fontSize');
        opacity: 1 !important;
    }

    .top-left-border, .top-right-border {
        border-top: var(--input-border);
    }

    /*# region States */

    .base-input {

        &.error:not(.disabled) {

            .bi_top {
                .top-left-border, .top-right-border {
                    border-top-style: var(--input-error-borderStyle);
                    border-top-color: var(--input-error-borderColor);
                }
            }

            .bi-wrap {
                border-right-style: var(--input-error-borderStyle);
                border-right-color: var(--input-error-borderColor);
                border-bottom-style: var(--input-error-borderStyle);
                border-bottom-color: var(--input-error-borderColor);
                border-left-style: var(--input-error-borderStyle);
                border-left-color: var(--input-error-borderColor);
            }

        }

        &:hover {
            .side-items:not(.empty) {
                display: flex;
            }
        }

        &:not(.disabled):not(.readonly):focus-within,
        &:not(.disabled):not(.readonly):focus {
            .bi-label {
                @mixin show-label;
            }

            .bi_top {
                .top-left-border, .top-right-border {
                    border-top-width: theme('borderWidth.--input-focus-borderWidth');
                }
            }

            .bi-wrap {
                padding: theme('padding.--input-focus-padding');
                border-width: theme('borderWidth.--input-focus-borderWidth');
            }

            &:not(.error) {
                .bi_top {
                    .top-left-border, .top-right-border {
                        border-top: var(--input-focus-border);
                    }
                }

                .bi-wrap {
                    border-right: var(--input-focus-border);
                    border-bottom: var(--input-focus-border);
                    border-left: var(--input-focus-border);
                }
            }

        }

        &.filled {
            .bi-label {
                @mixin show-label;
            }
        }

        &.disabled {
            /* Can not just apply opacity.
                because action buttons of input can be available for disabled input */


            .bi-label {
                opacity: theme('opacity.--input-disabled-opacity');
                color: theme('colors.--input-disabled-color');
            }

            .input-button-wrap {
                opacity: theme('opacity.--input-disabled-opacity');
                color: theme('colors.--input-disabled-color');
            }

            .bi-main {
                opacity: theme('opacity.--input-disabled-opacity');
                color: theme('colors.--input-disabled-color');
            }

            .bottom-text {
                opacity: theme('opacity.--input-disabled-opacity');
                color: theme('colors.--input-disabled-color');
            }
        }
    }

    /*# endregion States */

</style>
