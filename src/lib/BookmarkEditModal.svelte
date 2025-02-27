<script>
	import { dashboard_view, dashboard_content, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import CloseIcon from './icons/CloseIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';
	import DeleteIcon from './icons/DeleteIcon.svelte';

	let dialog;
	$effect(() => {
		if (dashboard_view.value === DASHBOARD_VIEW.BOOKMARK_EDIT) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	const bookmark = dashboard_content.getBookmarkEdit();
	let titleValue = $state(bookmark.title);
	let linkValue = $state(bookmark.link);
	let titleInput;
	let linkInput;

	$effect(() => {
		const bm = dashboard_content.getBookmarkEdit();
		titleValue = bm.title;
		linkValue = bm.link;
	});

	function saveBookmark() {
		dashboard_content.saveBookmarkEdit(titleValue, linkValue);
		dashboard_view.set(DASHBOARD_VIEW.EDIT);
	}
	function deleteBookmark() {
		const confirmDelete = confirm('Are you sure you want to delete this bookmark?');
		if (!confirmDelete) return;
		dashboard_content.deleteBookmarkEdit();
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
		saveBookmark();
	}
</script>

<dialog bind:this={dialog} onclose={() => dashboard_view.set(DASHBOARD_VIEW.EDIT)}>
	<div class="wrapper">
		<h4>edit bookmark</h4>
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
				title="delete bookmark"
				class="btn-danger delete"
				onclick={deleteBookmark}><DeleteIcon /></button
			>
			<button
				type="button"
				title="cancel bookmark edit"
				class="btn-secondary cancel"
				onclick={() => dashboard_view.set(DASHBOARD_VIEW.EDIT)}><CloseIcon /></button
			>
			<button type="button" title="save bookmark" onclick={saveBookmark}><SaveIcon /></button>
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
		justify-content: space-between;
		column-gap: 1rem;
	}

	.buttons .cancel {
		margin-left: auto;
	}
</style>
