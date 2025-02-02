<script>
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import { MIME_TYPES } from './client/draggable';
	import AddIcon from './icons/AddIcon.svelte';
	import DeleteIcon from './icons/DeleteIcon.svelte';
	import MoveIcon from './icons/MoveIcon.svelte';
	const { title, children, groupIndex } = $props();

	const dashboard_edit = $derived(EDIT_VIEWS.includes(dashboard_view.value));
	let titleValue = $state(title);

	$effect(() => {
		dashboard_content.setBookmarkGroupTitle(groupIndex, titleValue);
	});

	function createBookmark() {
		dashboard_content.setBookmarkAdd(groupIndex);
		dashboard_view.set(DASHBOARD_VIEW.BOOKMARK_CREATE);
	}

	function deleteBookmarkGroup() {
		const confirmDelete = confirm(
			`Are you sure you want to delete the bookmark group '${titleValue}' ?`
		);
		if (!confirmDelete) return;
		dashboard_content.deleteBookmarkGroup(groupIndex);
	}

	function bookmarkDragEnter(event) {
		const isBookmark = event.dataTransfer.types.includes(MIME_TYPES.BOOKMARK);
		if (!isBookmark) return;
		event.preventDefault();
	}

	function bookmarkDragOver(event) {
		const isBookmark = event.dataTransfer.types.includes(MIME_TYPES.BOOKMARK);
		if (!isBookmark) return;
		event.preventDefault();
	}

	function bookmarkDrop(event) {
		const isBookmark = event.dataTransfer.types.includes(MIME_TYPES.BOOKMARK);
		if (!isBookmark) return;
		const bookmark_data = JSON.parse(event.dataTransfer.getData(MIME_TYPES.BOOKMARK));
		console.log('drop bookmark', event, bookmark_data);
	}
</script>

<section draggable={dashboard_edit}>
	{#if dashboard_edit}
		<div class="group-edit">
			<input type="text" bind:value={titleValue} class="group-title" />
			<button
				type="button"
				title="move application group '{titleValue}'"
				class="btn-small btn-secondary move"><MoveIcon /></button
			>
			<button
				type="button"
				title="delete application group '{titleValue}'"
				class="btn-small btn-danger delete"
				onclick={deleteBookmarkGroup}><DeleteIcon /></button
			>
		</div>
	{:else}
		<h3 class="group-title">{title}</h3>
	{/if}
	<div
		class="items"
		role="list"
		ondragenter={bookmarkDragEnter}
		ondragover={bookmarkDragOver}
		ondrop={bookmarkDrop}
	>
		{@render children?.()}
		{#if dashboard_edit}
			<button
				type="button"
				title="add bookmark to group '{titleValue}'"
				class="btn-secondary bookmark-add"
				onclick={createBookmark}
			>
				<AddIcon />
			</button>
		{/if}
	</div>
</section>

<style>
	.group-edit {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
	.group-title {
		font-family: 'Courier New', Courier, monospace;
		font-weight: 700;
		color: var(--blue);
		display: block;
		font-size: 1.17em;
		margin-top: 0;
		margin-bottom: 0.5rem;
		margin-left: 0;
		margin-right: 0;
	}

	input.group-title {
		background: none;
		outline: none;
		border: none;
		border-bottom: 1px dashed var(--blue);
		padding-bottom: 0;
	}

	.items {
		display: flex;
		flex-direction: column;
		row-gap: 0.5em;
	}

	button.bookmark-add {
		margin-top: 0.5rem;
		width: 100px;
		height: max-content;
		box-sizing: border-box;
		padding: 0;
		height: 26px;
	}
</style>
