<template>
	<div
		class="node"
		:class="{ selected: data.selected }"
		:style="nodeStyles()"
		data-testid="node"
		ref="nodeElement"
	>
		<div class="action">
			<button @click.stop="onCopy" title="Copy">
				<span class="material-icons">content_copy</span>
			</button>
			<button @click.stop="onEdit" title="Edit">
				<span class="material-icons">edit</span>
			</button>
			<button @click.stop="onDelete" title="Delete">
				<span class="material-icons">delete</span>
			</button>
		</div>
		<div class="title" data-testid="title" @pointerdown.stop=""><span>{{ data.data.node.name }}</span></div>
		<div class="sub-title" data-testid="sub-title" @pointerdown.stop="">{{ data.data.node.user_code }}</div>
		<div>
			<div class="node-info">
				<div @pointerdown.stop="" class="node-info-header">
					<p>Node Details</p>
				</div>

				<div class="node-info-content">
					<div class="info-item" @pointerdown.stop="">
						<span class="info-label">Node User Code:</span>
						<b>{{ data.data.node.user_code }}</b>
					</div>

					<div class="info-item" @pointerdown.stop="" v-if="data.data.workflow.user_code">
						<span class="info-label">Workflow User Code:</span>
						<b>{{ data.data.workflow.user_code }}</b>
					</div>

					<div class="info-item" @pointerdown.stop="" v-if="data.data.workflow.name">
						<span class="info-label">Workflow Name:</span>
						<b>{{ data.data.workflow.name }}</b>
					</div>

					<div class="info-item" @pointerdown.stop="">
						<span class="info-label">Notes:</span>
						<textarea v-model="data.data.node.notes" class="info-value" rows="3"/>
					</div>
				</div>
			</div>

			<!-- Source Code Editor for the node -->

			<div v-if="data.data.node.type === 'source_code' || data.data.node.type === 'condition'">
				<div class="node-source-code-panel">
					<p>Source Code:</p>
					<button class="node-source-code-panel-edit-button" @click="isSourceCodeDialogOpen = true">Edit
					</button>

				</div>
				<v-ace-editor
					v-model:value="data.data.source_code"
					@init="sourceCodePreviewInit"
					lang="python"
					theme="monokai"
					style="height: 100px; width: 100%;"
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
		<BaseModal
			title="Source code"
			:isOpen="isSourceCodeDialogOpen"
			@closeModal="isSourceCodeDialogOpen = false"
			@okModal="isSourceCodeDialogOpen = !isSourceCodeDialogOpen"
		>
			<v-ace-editor
				v-model:value="data.data.source_code"
				@init="sourceCodeEditorInit"
				lang="python"
				theme="monokai"
				style="height: 400px; width: 100%;"
				@pointerdown.stop=""
			/>
		</BaseModal>

		<div class="resize-handle" @pointerdown.stop="" @mousedown="initResize"></div>

	</div>
</template>

<script lang="js">
import {defineComponent, ref} from 'vue';
import BaseModal from "~/components/base/Modal.vue";
import {Ref} from 'rete-vue-plugin';
import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

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
	emits: ['copyBlock', 'deleteBlock'],
	setup(props, {emit}) {
		const isSourceCodeDialogOpen = ref(false)
		const nodeElement = ref(null)

		const node = props.data

		let startX, startY, startWidth, startHeight
		let requestId = null

		const onCopy = () => {
			emit('copyBlock', node.id, 'copy')
		}

		const onEdit = () => {
			emit('copyBlock', node.id, 'edit')
		}

		const onDelete = () => {
			emit('deleteBlock', node.id)
		}

		const initResize = (e) => {
			startX = e.clientX
			startY = e.clientY
			startWidth = parseInt(document.defaultView.getComputedStyle(nodeElement.value).width, 10)
			startHeight = parseInt(document.defaultView.getComputedStyle(nodeElement.value).height, 10)
			document.documentElement.addEventListener('mousemove', resizeThrottled, false)
			document.documentElement.addEventListener('mouseup', stopResize, false)
		}

		const resizeThrottled = (e) => {
			if (!requestId) {
				requestId = requestAnimationFrame(() => {
					doResize(e)
					requestId = null
				})
			}
		}


		const doResize = (e) => {
			const minWidth = 300
			const minHeight = 350

			const newWidth = startWidth + e.clientX - startX
			const newHeight = startHeight + e.clientY - startY

			if (newWidth > minWidth) {
				nodeElement.value.style.width = newWidth + 'px';
				node.width = newWidth;
			}
			if (newHeight > minHeight) {
				nodeElement.value.style.height = newHeight + 'px';
				node.height = newHeight;
			}


		}


		const stopResize = () => {
			document.documentElement.removeEventListener('mousemove', resizeThrottled, false)
			document.documentElement.removeEventListener('mouseup', stopResize, false)
			if (requestId) {
				cancelAnimationFrame(requestId)
				requestId = null
			}
		}

		return {
			isSourceCodeDialogOpen,
			nodeElement,
			initResize,
			onCopy,
			onEdit,
			onDelete,
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
		sourceCodePreviewInit(editor) {
			editor.setHighlightActiveLine(false)
			editor.setShowPrintMargin(false)
			editor.setFontSize(5)
			editor.setBehavioursEnabled(true)
			editor.focus()
			editor.navigateFileStart()
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
		BaseModal,
		Ref
	}
})
</script>

<style lang="postcss" scoped>


.node {
	background: var(--surface-container-high);
	border: 2px solid #ddd; /* Softer border color */
	border-radius: 12px; /* More rounded corners */
	cursor: pointer;
	box-sizing: border-box;
	width: 400px;
	height: auto;
	padding: 16px 16px 6px 16px;
	position: relative;
	user-select: none;
	box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* Subtle shadow */
	transition: all 0.2s ease-in-out; /* Smooth transition for hover */

	&:hover {
		opacity: 1; /* Slight increase in opacity */
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* Stronger shadow on hover */

		.action {
			opacity: 1;
			pointer-events: unset;
		}
	}

	&.selected {
		border-color: #007bff; /* More vibrant color for selected node */
	}

	.title {
		font-family: 'Helvetica Neue', sans-serif;
		font-size: 20px; /* Slightly larger font */
		padding: 0 116px 0 0;
		font-weight: bold; /* Bold for better emphasis */
		cursor: auto;
	}

	.sub-title {
		font-size: 14px;
		cursor: auto;
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
		color: #777777; /* Medium grey for labels */
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

	.resize-handle {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 16px;
		height: 16px;
		cursor: se-resize;

		/* Add visual styling */
		background: linear-gradient(135deg, #007bff, #0056b3); /* Subtle gradient to make it look 3D */
		border-radius: 50%; /* Make it circular */
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Add a subtle shadow for depth */
		border: 2px solid #fff; /* White border for contrast */
		display: flex;
		align-items: center;
		justify-content: center;

		/* Transition effect for hover */
		transition: background-color 0.3s, transform 0.2s;
	}

	.resize-handle:hover {
		background: linear-gradient(135deg, #0056b3, #003e7e); /* Darken on hover */
		transform: scale(1.2); /* Make it a bit larger when hovered over */
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Make the shadow stronger on hover */
	}

	.resize-handle::before {
		content: '⤡'; /* Diagonal resize icon */
		font-size: 12px;
		color: #fff;
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
	background: var(--surface-container-high);
	padding: 8px;
	border-radius: 8px; /* Round corners for a modern look */
}

.node-info {
	margin: 16px 0;
	background: var(--surface-container-high);
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

.action {
	position: absolute;
	top: 8px;
	right: 8px;
	display: flex;
	gap: 4px;
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.2s;
	color: var(--primary);
}

textarea {
	background: transparent !important;
}
</style>
