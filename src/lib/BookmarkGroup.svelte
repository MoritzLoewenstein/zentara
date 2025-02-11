<script>
	import Bookmark from './Bookmark.svelte';
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import { getInsertIndex, MOVE_TYPES } from './client/draggable';
	import AddIcon from './icons/AddIcon.svelte';
	import DeleteIcon from './icons/DeleteIcon.svelte';
	import MoveIcon from './icons/MoveIcon.svelte';
	const { title, groupIndex, movePreview, items } = $props();

	// use $props.id() when available: https://github.com/sveltejs/svelte/pull/15185
	const groupId = Math.random().toString(36).substring(0, 6);

	let isDragging = $state(false);

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
		const isBookmark = event.dataTransfer.types.includes(MOVE_TYPES.BOOKMARK);
		if (!isBookmark) return;
		event.preventDefault();
	}

	function bookmarkDragOver(event) {
		const isBookmark = event.dataTransfer.types.includes(MOVE_TYPES.BOOKMARK);
		if (!isBookmark) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';

		const items = event.target.closest('.items');
		const insertIndex = getInsertIndex(items, event.clientY);
		const hidePreview =
			insertIndex === null ||
			(dashboard_content.value.move.group_index === groupIndex &&
				(dashboard_content.value.move.item_index === insertIndex ||
					dashboard_content.value.move.item_index === insertIndex - 1));
		if (hidePreview) {
			dashboard_content.resetMovePreview();
		} else {
			dashboard_content.updateMovePreview(groupIndex, insertIndex);
		}
	}

	function bookmarkDragLeave(event) {
		const isBookmark = event.dataTransfer.types.includes(MOVE_TYPES.BOOKMARK);
		if (!isBookmark) return;
		dashboard_content.resetMovePreview();
	}

	function bookmarkDrop(event) {
		const isBookmark = event.dataTransfer.types.includes(MOVE_TYPES.BOOKMARK);
		if (!isBookmark) return;
		event.preventDefault();

		const bookmark_data = JSON.parse(event.dataTransfer.getData(MOVE_TYPES.BOOKMARK));
		const items = event.target.closest('.items');
		const insertIndex = getInsertIndex(items, event.clientY);
		dashboard_content.resetMovePreview();
		dashboard_content.resetMove();
		dashboard_content.moveItem(MOVE_TYPES.BOOKMARK, bookmark_data, groupIndex, insertIndex);
	}
</script>

<section
	class="group"
	draggable={dashboard_edit}
	class:movePreview
	class:moving={isDragging}
	role="listitem"
	aria-grabbed={isDragging}
	aria-owns={groupId}
	ondragstart={(event) => {
		isDragging = true;
		dashboard_content.setMove(MOVE_TYPES.BOOKMARK_GROUP, groupIndex);
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData(
			MOVE_TYPES.BOOKMARK_GROUP,
			JSON.stringify({ groupIndex, title, items })
		);
	}}
	ondragend={() => {
		isDragging = false;
		dashboard_content.resetMovePreview();
		dashboard_content.resetMove();
	}}
>
	{#if dashboard_edit}
		<div class="group-heading">
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
		id={groupId}
		class="items"
		role="group"
		ondragenter={(e) => bookmarkDragEnter(e)}
		ondragover={(e) => bookmarkDragOver(e)}
		ondragleave={(e) => bookmarkDragLeave(e)}
		ondrop={(e) => bookmarkDrop(e)}
	>
		{#each items as bookmark, itemIndex (bookmark)}
			<Bookmark {...bookmark} {groupIndex} {itemIndex} />
		{/each}
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
	.group.moving:not(.movePreview) {
		border: 1px dashed var(--blue);
		opacity: 0.5;
	}

	.group.movePreview {
		opacity: 0.5;
	}
	.group-heading {
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
