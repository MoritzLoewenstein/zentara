<script>
	import { dashboard_state, DASHBOARD_STATES } from './settings.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';
	import DeleteIcon from './icons/DeleteIcon.svelte';

	let titleValue = $state('');
	let linkValue = $state('');

	function saveBookmark() {
		//TODO actually save newly created bookmark data locally
		dashboard_state.set(DASHBOARD_STATES.EDIT);
	}
	function deleteBookmark() {
		const confirmDelete = confirm('Are you sure you want to delete this bookmark?');
		if (!confirmDelete) return;
		//TODO actually delete bookmark data locally
		dashboard_state.set(DASHBOARD_STATES.EDIT);
	}
</script>

<dialog open={dashboard_state.state === DASHBOARD_STATES.EDIT_BOOKMARK}>
	<div class="wrapper">
		<h4>Edit Bookmark</h4>
		<label>
			Title
			<input type="text" bind:value={titleValue} placeholder="r/homelab" />
		</label>
		<label>
			Link
			<input type="url" bind:value={linkValue} placeholder="https://reddit.com/r/homelab" />
		</label>
		<div class="buttons">
			<button
				type="button"
				title="delete bookmark"
				class="btn-danger delete"
				onclick={deleteBookmark}><DeleteIcon /></button
			>
			<button
				type="button"
				title="cancel bookmark creation"
				class="btn-secondary cancel"
				onclick={() => dashboard_state.set(DASHBOARD_STATES.EDIT)}><CloseIcon /></button
			>
			<button type="button" title="save bookmark" onclick={saveBookmark}><SaveIcon /></button>
		</div>
	</div>
</dialog>

<style>
	dialog {
		width: 250px;
	}

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
		justify-content: space-between;
		column-gap: 1rem;
	}

	.buttons .cancel {
		margin-left: auto;
	}
</style>
