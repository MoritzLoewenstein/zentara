<script>
	import CloseIcon from './icons/CloseIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';
	import { dashboard_content, dashboard_view, DASHBOARD_VIEW } from './settings.svelte.js';

	async function saveDashboard() {
		dashboard_content.commitDashboardEdit();
		dashboard_view.set(DASHBOARD_VIEW.DASHBOARD);
		const res = await fetch('/', {
			method: 'POST',
			body: JSON.stringify(dashboard_content),
			credentials: 'same-origin'
		});
		//TODO display error toast and revert to edit mode
		if (!res.ok) {
			console.error('Failed to save dashboard');
			dashboard_view.set(DASHBOARD_VIEW.EDIT);
		}
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
