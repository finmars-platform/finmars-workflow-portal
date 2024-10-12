<template>
	<div
		class="node"
		:class="{ selected: data.selected }"
		:style="nodeStyles()"
		data-testid="node"
	>
		<div class="title" data-testid="title" @pointerdown.stop="">{{ data.data.node.name }}</div>
		<div>
			<div class="node-info">
				<div @pointerdown.stop="" class="node-info-header">
					<p>Node Details</p>
				</div>

				<div class="node-info-content">
					<div class="info-item" @pointerdown.stop="">
						<span class="info-label">Node User Code:</span>
						<input v-model="data.data.node.user_code" class="info-value" readonly />
					</div>

					<div class="info-item" @pointerdown.stop="" v-if="data.data.workflow.user_code">
						<span class="info-label">Workflow User Code:</span>
						<input v-model="data.data.workflow.user_code" class="info-value" readonly />
					</div>

					<div class="info-item" @pointerdown.stop="" v-if="data.data.workflow.name">
						<span class="info-label">Workflow Name:</span>
						<input v-model="data.data.workflow.name" class="info-value" readonly />
					</div>

					<div class="info-item" @pointerdown.stop="">
						<span class="info-label">Notes:</span>
						<textarea v-model="data.data.node.notes" class="info-value" rows="3" />
					</div>
				</div>
			</div>

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
	background: #f8f9fa; /* Light background for a cleaner look */
	border: 2px solid #ddd; /* Softer border color */
	border-radius: 12px; /* More rounded corners */
	cursor: pointer;
	box-sizing: border-box;
	width: 400px;
	height: auto;
	padding-bottom: 6px;
	position: relative;
	user-select: none;
	padding: 16px; /* Increase padding for breathing room */
	box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
	transition: all 0.2s ease-in-out; /* Smooth transition for hover */

	&:hover {
		opacity: 1; /* Slight increase in opacity */
		box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.15); /* Stronger shadow on hover */
	}

	&.selected {
		border-color: #007bff; /* More vibrant color for selected node */
	}

	.title {
		color: #333; /* Darker text color for better readability */
		font-family: 'Helvetica Neue', sans-serif;
		font-size: 20px; /* Slightly larger font */
		padding: 12px 0;
		font-weight: bold; /* Bold for better emphasis */
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
		color: #555; /* Medium grey for labels */
		display: inline-block;
		font-family: 'Helvetica Neue', sans-serif;
		font-size: 14px;
		margin: 4px;
		line-height: 1.4;
	}

	.input-control {
		z-index: 1;
		vertical-align: middle;
		display: inline-block;
	}

	.control {
		padding: 4px;
	}
}

.input-socket--payload {
	background-color: transparent;
	border-radius: 50%;
	display: inline-block;
	margin-left: -1px;
	border: 2px solid #007bff; /* Blue border for payload */
}

.node-source-code-panel {
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: #f1f3f5; /* Light background for the panel */
	padding: 8px;
	border-radius: 8px; /* Round corners for a modern look */
}

.node-source-code-panel-edit-button {
	border: 1px solid #007bff;
	border-radius: 4px;
	padding: 6px 12px;
	margin: 8px 4px;
	background-color: #007bff;
	color: #fff;
	font-size: 14px;
	cursor: pointer;
	transition: background-color 0.2s ease-in-out;
}

.node-source-code-panel-edit-button:hover {
	background-color: #0056b3; /* Darker blue on hover */
	opacity: 0.9;
}

.node-info {
	margin: 16px 0;
	background: #f8f9fa;
	padding: 12px;
	border-radius: 8px;
	border: 1px solid #ddd;
}

.node-info-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
	font-weight: bold;
	color: #333;
}

.node-info-content {
	margin-top: 12px;
}

.info-item {
	margin-bottom: 12px;
}

.info-label {
	font-weight: bold;
	margin-right: 8px;
	display: inline-block;
	width: 150px;
}

.info-value {
	background: #fff;
	border: 1px solid #ccc;
	border-radius: 4px;
	padding: 4px 8px;
	width: 100%;
}

</style>
