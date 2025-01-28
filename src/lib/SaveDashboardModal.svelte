<script>
	import CloseIcon from './icons/CloseIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';
	import { DASHBOARD_STATES, dashboard_state } from './settings.svelte.js';

	async function saveDashboard() {
		//TODO fetch API with serialized dashboard data
		//TODO optimistic update, show success message
		//TODO in case of failure go back to edit mode and display an error message
		// https://svelte.dev/docs/svelte/bind
		dashboard_state.set(DASHBOARD_STATES.DEFAULT);
	}
</script>

<dialog open={dashboard_state.state === DASHBOARD_STATES.EDIT}>
	<button
		title="cancel dashboard edit"
		class="btn-secondary"
		onclick={() => dashboard_state.set(DASHBOARD_STATES.DEFAULT)}
	>
		<CloseIcon />
	</button>
	<button title="save dashboard" onclick={saveDashboard}><SaveIcon /></button>
</dialog>

<style>
	dialog {
		position: fixed;;
		right: var(--side-padding);
		bottom: 2rem;
		margin-right: 0;
		width: max-content;
	}
</style>
