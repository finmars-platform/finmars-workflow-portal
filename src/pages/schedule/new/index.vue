<template>
	<div class="schedule-edit-page">
		<div class="pb-4">
			<FmBreadcrumbs :crumbs="crumbs" @update-crumbs="handleCrumbs" />
		</div>
		<form class="schedule-form">
			<table class="schedule-info-table">

				<tr>
					<th>User Code</th>
					<td>
						<FmTextField
							v-model="schedule.user_code"
							:rules="[rules.required]"
							outlined
							clearable
						/>
					</td>
				</tr>

				<tr>
					<th>Name</th>
					<td>
						<FmTextField
							v-model="schedule.name"
							:rules="[rules.required]"
							outlined
							clearable
						/>
					</td>
				</tr>

				<tr>
					<th>Workflow User Code</th>
					<td>
						<FmTextField
							v-model="schedule.workflow_user_code"
							:rules="[rules.required]"
							outlined
							clearable
						/>
					</td>
				</tr>

				<tr>
					<th>Crontab (UTC) Line</th>
					<td>
						<FmTextField
							v-model="schedule.crontab_line"
							:rules="[rules.required]"
							placeholder="54 12 * * *"
							outlined
							clearable
						/>
					</td>
				</tr>


				<tr>
					<th>Notes</th>
					<td>
						<textarea
							id="notes"
							name="notes"
							rows="4"
							cols="50"
							v-model="schedule.notes"
						/>
					</td>
				</tr>

				<tr>
					<th>Payload</th>
					<td>

						<v-ace-editor
							v-model:value="schedulePayload"
							@init="payloadEditorInit"
							lang="json"
							theme="monokai"
							style="height: 300px;width: 100%;"/>


					</td>
				</tr>

				<tr>
					<th>Manager</th>
					<td>
						<FmSelect
							v-model="schedule.is_manager"
							variant="outlined"
							:options="managerOptions"
							@update:modelValue="updateManagerOpt"
						/>
					</td>
				</tr>
				<tr>
					<th>Enabled</th>
					<td>
						<FmSelect
							v-model="schedule.enabled"
							variant="outlined"
							:options="enableOptions"
							@update:modelValue="updateEnableOpt"
						/>
					</td>
				</tr>
			</table>

			<div class="action-buttons">
				<FmButton type="primary" @click.prevent="createSchedule" rounded>Create</FmButton>
			</div>
		</form>
	</div>
</template>

<script setup>
import {FmBreadcrumbs, FmButton, FmSelect, FmTextField} from '@finmars/ui';
import {VAceEditor} from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';

definePageMeta({
	middleware: "auth",
});

const route = useRoute();
const router = useRouter();

const store = useStore();
store.init();

const crumbs = ref([
	{ title: 'Schedule', path: 'schedule' },
	{ title: 'New', path: 'new' }
]);

const schedulePayload = ref('');
const schedule = ref({is_manager: true, enabled: true});

const managerOptions = [
	{ title: 'Yes', value: true },
	{ title: 'No', value: false }
];

const enableOptions = [
	{ title: 'Yes', value: true },
	{ title: 'No', value: false }
];

const rules = {
	required: value => value ? '' : 'Field is required'
}

const handleCrumbs = (newCrumbs, newPath) => {
	router.push(`/${store.realm_code}/${store.space_code}/w` + newPath);
};

function updateManagerOpt(val){
	schedule.value.is_manager = val;
}

function updateEnableOpt(val){
	schedule.value.enabled = val;
}

async function createSchedule() {
	schedule.value.payload = JSON.parse(schedulePayload.value)
	const res = await useApi('schedule.post', {
		body: schedule.value,
	});

	if (res && res._$error) {
		useNotify({
			type: 'error',
			title: res._$error.message || res._$error.error.details
		});
	} else {
		useNotify({
			type: 'success',
			title: 'Success',
			text: 'Schedule created successfully!'
		});
		const id = res.id;
		router.push(`/${store.realm_code}/${store.space_code}/w/schedule/${id}/`);
	}
}

function payloadEditorInit(payloadEditor) {
	payloadEditor.setHighlightActiveLine(false);
	payloadEditor.setShowPrintMargin(false);
	payloadEditor.setFontSize(14)
	payloadEditor.setBehavioursEnabled(true);
	payloadEditor.focus();
	payloadEditor.navigateFileStart();
}

</script>

<style scoped lang="postcss">
.schedule-edit-page {
	padding: 0 20px 20px 20px;
}

.schedule-info-table {
	width: 100%;
	border-collapse: collapse;
	margin-bottom: 20px;
}

.schedule-info-table th, .schedule-info-table td {
	padding: 10px;
	border-bottom: 1px solid #ddd;
	text-align: left;
}

.schedule-info-table th {
	background-color: #f5f5f5;
	width: 150px;
	font-weight: bold;
}

textarea {
	width: 100%;
	border-radius: var(--spacing-4);
	padding: var(--spacing-8);
	border: 1px solid var(--card-border-color);
}
</style>
