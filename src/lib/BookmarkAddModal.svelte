<script>
	import { dashboard_view, dashboard_content, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import AddIcon from './icons/AddIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';

	let dialog;
	$effect(() => {
		if (dashboard_view.value === DASHBOARD_VIEW.BOOKMARK_CREATE) {
			dialog.showModal();
		} else {
			dialog.close();
			titleValue = '';
			linkValue = '';
		}
	});

	let titleValue = $state('');
	let linkValue = $state('');
	let titleInput;
	let linkInput;

	function createBookmark() {
		dashboard_content.addBookmark(titleValue, linkValue);
		dashboard_view.set(DASHBOARD_VIEW.EDIT);
	}

	function trySubmit(event) {
		if (event.key !== 'Enter') {
			return;
		}
		if (!titleValue) {
			titleInput.reportValidity();
			return;
		}
		if (!linkValue) {
			linkInput.reportValidity();
			return;
		}
		createBookmark();
	}
</script>

<dialog bind:this={dialog} onclose={() => dashboard_view.set(DASHBOARD_VIEW.EDIT)}>
	<div class="wrapper">
		<h4>create bookmark</h4>
		<label>
			title
			<input
				type="text"
				bind:this={titleInput}
				bind:value={titleValue}
				placeholder="r/homelab"
				required
				onkeydown={trySubmit}
			/>
		</label>
		<label>
			link
			<input
				type="url"
				bind:this={linkInput}
				bind:value={linkValue}
				placeholder="https://reddit.com/r/homelab"
				required
				onkeydown={trySubmit}
			/>
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
