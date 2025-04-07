<template>
	<div
		class="node"
		:class="[{ 'node-with-task': data.data.taskId, 'node-without-task': !data.data.taskId }, { selected: data.selected }]"
		:style="nodeStyles()"
		data-testid="node"
	>
		<div class="node-header">
			<div class="title" data-testid="title">
				<span v-if="data.data.taskId" class="task-badge">Task ID: {{ data.data.taskId }}</span>
				{{ data.data.node.name }}
			</div>
			<StatusBadge :status="data.data.status" />
		</div>

		<div class="node-details">
			<div v-if="data.data.node.user_code">Node User Code: <strong>{{ data.data.node.user_code }}</strong></div>
			<div v-if="data.data.workflow.user_code">Workflow User Code: <strong>{{ data.data.workflow.user_code }}</strong></div>
			<div v-if="data.data.workflow.name">Workflow Name: <strong>{{ data.data.workflow.name }}</strong></div>
			<div v-if="data.data.node.notes">Notes: <em>{{ data.data.node.notes }}</em></div>
		</div>

		<!-- Outputs -->
		<div class="output" v-for="[key, output] in outputs()" :key="key + seed" :data-testid="'output-' + key">
			<div class="output-title">{{ output.label }}</div>
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

		<!-- Controls -->
		<Ref
			class="control"
			v-for="[key, control] in controls()"
			:key="key + seed"
			:emit="emit"
			:data="{ type: 'control', payload: control }"
			:data-testid="'control-' + key"
		/>

		<!-- Inputs -->
		<div
			:class="{
					  'input-socket': true,
					  'input-socket--payload': key === 'payload_input'
					}"
			v-for="[key, input] in inputs()"
			:key="key + seed"
			:data-testid="'input-' + key"
		>
			<Ref
				class="input-socket"
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
			<div class="input-title" v-show="!input.control || !input.showControl">{{ input.label }}</div>
			<Ref v-show="input.control && input.showControl" class="input-control" :emit="emit" :data="{ type: 'control', payload: input.control }" />
		</div>
	</div>
</template>

<script lang="js">
import { ref, defineComponent } from 'vue'
import { Ref } from 'rete-vue-plugin'
import StatusBadge from "~/components/StatusBadge.vue";

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
		}
	},
	components: {
		StatusBadge,
		Ref
	}
})
</script>

<style lang="postcss" scoped>
.node {
	border: 2px solid #ccc;
	border-radius: 12px;
	cursor: pointer;
	box-sizing: border-box;
	width: 420px;
	height: auto;
	padding: 16px;
	position: relative;
	user-select: none;
	transition: box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.node-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.task-badge {
	color: #fff;
	padding: 2px 8px;
	border-radius: 12px;
	font-size: 12px;
	margin-right: 8px;
}

.node-details {
	margin-bottom: 12px;
}

.node-details div {
	margin-bottom: 4px;
}

.title {
	color: #333;
	font-family: 'Arial', sans-serif;
	font-size: 18px;
	font-weight: bold;
}

.output {
	text-align: right;
	margin-bottom: 8px;
}

.output-socket,
.input-socket {
	text-align: right;
	margin-right: -1px;
	display: inline-block;
}

.input-socket--payload {
	border-color: #007bff; /* Different color for payload input */
}

.input-title,
.output-title {
	vertical-align: middle;
	font-family: 'Arial', sans-serif;
	font-size: 14px;
	margin: 4px;
	display: inline-block;
}

.input-control {
	z-index: 1;
	vertical-align: middle;
	display: inline-block;
}

.control {
	padding: 4px;
}

/* Hover effect */
.node:hover {
	box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
	opacity: 1;
}
</style>
