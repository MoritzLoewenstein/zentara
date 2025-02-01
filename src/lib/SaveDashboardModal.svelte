<script>
	import CloseIcon from './icons/CloseIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';
	import { dashboard_content, dashboard_view, DASHBOARD_VIEW } from './settings.svelte.js';

	async function saveDashboard() {
		//TODO fetch API with serialized dashboard data
		//TODO optimistic update, show success message
		//TODO in case of failure go back to edit mode and display an error message
		// https://svelte.dev/docs/svelte/bind
		dashboard_content.commitDashboardEdit();
		dashboard_view.set(DASHBOARD_VIEW.DASHBOARD);
	}
</script>

<dialog open={dashboard_view.value === DASHBOARD_VIEW.EDIT}>
	<button
		title="cancel dashboard edit"
		class="btn-secondary"
		onclick={() => dashboard_view.set(DASHBOARD_VIEW.DASHBOARD)}
	>
		<CloseIcon />
	</button>
	<button title="save dashboard" onclick={saveDashboard}><SaveIcon /></button>
</dialog>

<style>
	dialog {
		position: fixed;
		right: var(--side-padding);
		bottom: 2rem;
		margin-right: 0;
		width: max-content;
	}
</style>
