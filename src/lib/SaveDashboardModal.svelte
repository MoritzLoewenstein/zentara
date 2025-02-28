<script>
	import CloseIcon from './icons/CloseIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';
	import { dashboard_content, dashboard_view, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import { toast } from './client/toast.svelte';

	let dialog;
	$effect(() => {
		if (dashboard_view.value === DASHBOARD_VIEW.EDIT) {
			dialog.show();
		} else {
			dialog.close();
		}
	});

	async function saveDashboard() {
		dashboard_content.commitDashboardEdit();
		// if the fetch takes longer than 100ms, we'll do optimistic UI
		let used_optimistic_ui = false;
		const optimistic_ui_timeout = setTimeout(() => {
			used_optimistic_ui = true;
			dashboard_view.set(DASHBOARD_VIEW.DASHBOARD);
		}, 100);
		const res = await fetch('/', {
			method: 'POST',
			body: JSON.stringify(dashboard_content.value.dashboard),
			credentials: 'same-origin'
		});
		if (res.ok) {
			return;
		}
		if (used_optimistic_ui) {
			toast.add('Failed to save dashboard, reverting to edit mode', 'error');
			dashboard_view.set(DASHBOARD_VIEW.EDIT);
		} else {
			// still in edit mode
			toast.add('Failed to save dashboard');
			clearTimeout(optimistic_ui_timeout);
		}
	}
</script>

<dialog bind:this={dialog}>
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
