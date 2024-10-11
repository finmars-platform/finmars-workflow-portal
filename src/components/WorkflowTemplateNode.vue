<template>
	<div
		class="node"
		:class="{ selected: data.selected }"
		:style="nodeStyles()"
		data-testid="node"
	>
		<div class="title" data-testid="title" @pointerdown.stop="">{{ data.data.node.name }}</div>
		<div>
			<div @pointerdown.stop="">Node User Code: {{ data.data.node.user_code }}</div>
			<div @pointerdown.stop="">Workflow User Code: {{ data.data.workflow.user_code }}</div>
			<div @pointerdown.stop="">Workflow Name {{ data.data.workflow.name }}</div>

			<div @pointerdown.stop="">{{ data.data.node.notes }}</div>

			<!-- Source Code Editor for the node -->

			<div v-if="data.data.node.type === 'source_code' || data.data.node.type === 'condition'">
				<div class="node-source-code-panel">
					<p>Source Code:</p>
					<button class="node-source-code-panel-edit-button" @click="isSourceCodeDialogOpen = true">Edit</button>
				</div>
				<v-ace-editor
					v-model:value="data.data.source_code"
					@init="sourceCodeEditorInit"
					lang="python"
					theme="monokai"
					style="height: 200px; width: 100%;"
					@pointerdown.stop=""
				/>
			</div>

		</div>
		<!-- Outputs-->
		<div
			class="output"
			v-for="[key, output] in outputs()"
			:key="key + seed"
			:data-testid="'output-' + key"
		>
			<div class="output-title" data-testid="output-title">
				{{ output.label }}
			</div>
			<Ref
				class="output-socket"
				:emit="emit"
				:data="{
          type: 'socket',
          side: 'output',
          key: key,
          nodeId: data.id,
          payload: output.socket,
        }"
				data-testid="output-socket"
			/>
		</div>
		<!-- Controls-->
		<Ref
			class="control"
			v-for="[key, control] in controls()"
			:key="key + seed"
			:emit="emit"
			:data="{ type: 'control', payload: control }"
			:data-testid="'control-' + key"
		/>
		<!-- Inputs-->
		<div
			class="input"
			v-for="[key, input] in inputs()"
			:key="key + seed"
			:data-testid="'input-' + key"
		>
			<Ref
				:class="{
					  'input-socket': true,
					  'input-socket--payload': key === 'payload_input'  // Add specific class for payload_input
					}"
				:emit="emit"
				:data="{
          type: 'socket',
          side: 'input',
          key: key,
          nodeId: data.id,
          payload: input.socket,
        }"
				data-testid="input-socket"
			/>
			<div
				class="input-title"
				v-show="!input.control || !input.showControl"
				data-testid="input-title"
			>
				{{ input.label }}
			</div>
			<Ref
				class="input-control"
				v-show="input.control && input.showControl"
				:emit="emit"
				:data="{ type: 'control', payload: input.control }"
				data-testid="input-control"
			/>
		</div>


		<fm-base-modal
			title="Source code"
			style="width: 80vw;"
			v-model="isSourceCodeDialogOpen"
		>


			<v-ace-editor
				v-model:value="data.data.source_code"
				@init="sourceCodeEditorInit"
				lang="python"
				theme="monokai"
				style="height: 400px; width: 100%;"
				@pointerdown.stop=""
			/>

			<template #footer>
				<div class="flex flex-row justify-between">
					<fm-btn type="filled" @click="isSourceCodeDialogOpen = !isSourceCodeDialogOpen">Save</fm-btn>
				</div>
			</template>
		</fm-base-modal>

	</div>
</template>

<script lang="js">
import {defineComponent, ref} from 'vue'
import {Ref} from 'rete-vue-plugin'
import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

import {BaseModal as FmBaseModal, FmBtn as FmBtn} from "@finmars/ui"


function sortByIndex(entries) {
	entries.sort((a, b) => {
		const ai = a[1] && a[1].index || 0
		const bi = b[1] && b[1].index || 0

		return ai - bi
	})
	return entries
}

export default defineComponent({
	props: ['data', 'emit', 'seed'],
	setup() {
		// Define your reactive ref here
		const isSourceCodeDialogOpen = ref(false)


		return {
			isSourceCodeDialogOpen,
		}
	},
	methods: {
		nodeStyles() {
			return {
				width: Number.isFinite(this.data.width) ? `${this.data.width}px` : '',
				height: Number.isFinite(this.data.height) ? `${this.data.height}px` : ''
			}
		},
		inputs() {
			return sortByIndex(Object.entries(this.data.inputs))
		},
		controls() {
			return sortByIndex(Object.entries(this.data.controls))
		},
		outputs() {
			return sortByIndex(Object.entries(this.data.outputs))
		},
		sourceCodeEditorInit(editor) {
			editor.setHighlightActiveLine(false)
			editor.setShowPrintMargin(false)
			editor.setFontSize(14)
			editor.setBehavioursEnabled(true)
			editor.focus()
			editor.navigateFileStart()
		}
	},
	components: {
		VAceEditor,
		FmBaseModal,
		FmBtn,
		Ref
	}
})
</script>

<style lang="postcss" scoped>


.node {
	background: #fff;
	border: 2px solid grey;
	border-radius: 10px;
	cursor: pointer;
	box-sizing: border-box;
	width: 400px;
	height: auto;
	padding-bottom: 6px;
	position: relative;
	user-select: none;
	padding: 8px;

	&:hover {
		opacity: .8;
	}

	&.selected {
		border-color: red;
	}

	.title {
		color: #000;
		font-family: sans-serif;
		font-size: 18px;
		padding: 8px;
	}

	.output {
		text-align: right;
	}

	.input {
		text-align: left;
	}

	.output-socket {
		text-align: right;
		margin-right: -1px;
		display: inline-block;
	}

	.input-socket {
		text-align: left;
		margin-left: -1px;
		display: inline-block;
	}

	.input-title,
	.output-title {
		vertical-align: middle;
		color: #000;
		display: inline-block;
		font-family: sans-serif;
		font-size: 14px;
		margin: 4px;
		line-height: 1;
	}

	.input-control {
		z-index: 1;
		//width: calc(100% - #{$socket-size + 2 * $socket-margin});
		vertical-align: middle;
		display: inline-block;
	}

	.control {
		//padding: $socket-margin math.div($socket-size, 2) + $socket-margin;
	}
}

.input-socket--payload {
	background-color: transparent; /* Purple color */
	border-radius: 50%;
	//width: 16px;
	//height: 16px;
	display: inline-block;
	margin-left: -1px;
	border: 2px solid #000; /* Darker purple border */
}
.node-source-code-panel {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.node-source-code-panel-edit-button {
	border: 1px solid #000;
	border-radius: 4px;
	padding: 4px 8px;
	margin: 8px 4px;
}
.node-source-code-panel-edit-button:hover {
	opacity: .9;
}
</style>
