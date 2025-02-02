<script>
	import { dashboard_view, dashboard_content, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import AddIcon from './icons/AddIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';

	const { groupIndex } = $props();

	let dialog;
	$effect(() => {
		if (dashboard_view.value === DASHBOARD_VIEW.APPLICATION_CREATE) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	let iconValue = $state('');
	let nameValue = $state('');
	let linkValue = $state('');

	function createApplication() {
		// use https://www.npmjs.com/package/dompurify for svgs on server
		//TODO: icon img to string
		dashboard_content.addApplication(groupIndex, iconValue, nameValue, linkValue);
		dashboard_view.set(DASHBOARD_VIEW.EDIT);
	}
</script>

<dialog bind:this={dialog}>
	<div class="wrapper">
		<h4>create application</h4>
		<label>
			name
			<input type="text" bind:value={nameValue} placeholder="grafana" />
		</label>
		<label>
			link
			<input type="url" bind:value={linkValue} placeholder="https://grafana.example.org" />
		</label>
		<input
			type="file"
			accept="image/png, image/jpeg, image/svg+xml"
			bind:value={iconValue}
			placeholder="Image"
		/>
		<div class="buttons">
			<button
				type="button"
				title="cancel application creation"
				class="btn-secondary"
				onclick={() => dashboard_view.set(DASHBOARD_VIEW.EDIT)}><CloseIcon /></button
			>
			<button type="button" title="create application" onclick={createApplication}
				><AddIcon /></button
			>
		</div>
	</div>
</dialog>

<style>
	dialog .wrapper {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
	}

	h4 {
		margin: 0;
	}

	label {
		display: flex;
		flex-direction: column;
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		column-gap: 1rem;
	}
</style>
