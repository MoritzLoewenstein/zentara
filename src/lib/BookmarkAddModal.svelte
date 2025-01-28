<script>
	import { dashboard_view, DASHBOARD_VIEW } from './settings.svelte';
	import AddIcon from './icons/AddIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';

	let dialog;
	$effect(() => {
		if (dashboard_view.value === DASHBOARD_VIEW.BOOKMARK_CREATE) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	let titleValue = $state('');
	let linkValue = $state('');

	function createBookmark() {
		//TODO actually save newly created bookmark data locally
		dashboard_view.set(DASHBOARD_VIEW.EDIT);
	}
</script>

<dialog bind:this={dialog}>
	<div class="wrapper">
		<h4>create bookmark</h4>
		<label>
			title
			<input type="text" bind:value={titleValue} placeholder="r/homelab" />
		</label>
		<label>
			link
			<input type="url" bind:value={linkValue} placeholder="https://reddit.com/r/homelab" />
		</label>
		<div class="buttons">
			<button
				type="button"
				title="cancel bookmark creation"
				class="btn-secondary"
				onclick={() => dashboard_view.set(DASHBOARD_VIEW.EDIT)}><CloseIcon /></button
			>
			<button type="button" title="create bookmark" onclick={createBookmark}><AddIcon /></button>
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
