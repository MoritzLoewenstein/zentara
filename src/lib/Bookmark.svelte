<script>
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import { MOVE_TYPES } from './client/draggable.js';
	import EditIcon from './icons/EditIcon.svelte';
	import MoveIcon from './icons/MoveIcon.svelte';
	const { title, link, movePreview, groupIndex, itemIndex } = $props();

	let isDragging = $state(false);

	function editBookmark() {
		dashboard_content.setBookmarkEdit(groupIndex, itemIndex);
		dashboard_view.set(DASHBOARD_VIEW.BOOKMARK_EDIT);
	}
</script>

{#if EDIT_VIEWS.includes(dashboard_view.value)}
	<div
		class="bookmark-edit"
		class:movePreview
		class:moving={isDragging}
		draggable="true"
		role="listitem"
		aria-grabbed={isDragging}
		ondragstart={(event) => {
			// prevent bookmarkGroup from being dragged
			event.stopPropagation();
			isDragging = true;
			dashboard_content.setMove(MOVE_TYPES.BOOKMARK, groupIndex, itemIndex);
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData(
				MOVE_TYPES.BOOKMARK,
				JSON.stringify({ groupIndex, itemIndex, title, link })
			);
		}}
		ondragend={() => {
			isDragging = false;
			dashboard_content.resetMovePreview();
			dashboard_content.resetMove();
		}}
	>
		<p>{title}</p>
		<button type="button" title="move bookmark '{title}'" class="btn-small btn-secondary move"
			><MoveIcon /></button
		>
		<button
			type="button"
			title="edit bookmark '{title}'"
			class="btn-small btn-secondary edit"
			onclick={editBookmark}><EditIcon /></button
		>
	</div>
{:else}
	<a href={link} target="_blank" rel="noopener noreferrer">
		{title}
	</a>
{/if}

<style>
	a {
		line-height: 22px;
	}

	a:hover {
		text-decoration: underline;
	}

	.bookmark-edit {
		cursor: move;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		column-gap: 0.5rem;
	}

	.bookmark-edit.moving:not(.movePreview) {
		border: 1px dashed var(--blue);
		opacity: 0.5;
	}

	.bookmark-edit.movePreview {
		opacity: 0.5;
	}

	.bookmark-edit p {
		margin: 0;
		line-height: 22px;
	}

	.bookmark-edit button.move {
		margin-left: auto;
		cursor: move;
	}

	.bookmark-edit button.edit {
		cursor: pointer;
	}
</style>
