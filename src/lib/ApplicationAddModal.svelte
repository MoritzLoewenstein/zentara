<script>
	import { dashboard_state, DASHBOARD_STATES } from './settings.svelte';
	import AddIcon from './icons/AddIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';

	let titleValue = $state('');
	let linkValue = $state('');
	let imageValue = $state('');
	// use https://www.npmjs.com/package/dompurify for svgs

	function createApplication() {
		//TODO actually save newly created application data locally
		dashboard_state.set(DASHBOARD_STATES.EDIT);
	}
</script>

<dialog open={dashboard_state.state === DASHBOARD_STATES.CREATE_APPLICATION}>
	<div class="wrapper">
		<h4>create application</h4>
		<label>
			title
			<input type="text" bind:value={titleValue} placeholder="grafana" />
		</label>
		<label>
			link
			<input type="url" bind:value={linkValue} placeholder="https://grafana.example.org" />
		</label>
		<input
			type="file"
			accept="image/png, image/jpeg, image/svg+xml"
			bind:value={imageValue}
			placeholder="Image"
		/>
		<div class="buttons">
			<button
				type="button"
				title="cancel application creation"
				class="btn-secondary"
				onclick={() => dashboard_state.set(DASHBOARD_STATES.EDIT)}><CloseIcon /></button
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

	dialog {
		position: fixed;
		z-index: 3;
	}

	dialog::backdrop {
		position: fixed;
		z-index: 5;
		background-color: red;
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
