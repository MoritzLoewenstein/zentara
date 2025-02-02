<script>
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import { MIME_TYPES } from './client/draggable.js';
	import EditIcon from './icons/EditIcon.svelte';
	import MoveIcon from './icons/MoveIcon.svelte';
	const { title, link, groupIndex, bookmarkIndex } = $props();

	let isDragging = $state(false);

	function editBookmark() {
		dashboard_content.setBookmarkEdit(groupIndex, bookmarkIndex);
		dashboard_view.set(DASHBOARD_VIEW.BOOKMARK_EDIT);
	}
</script>

{#if EDIT_VIEWS.includes(dashboard_view.value)}
	<div
		class="bookmark-edit"
		draggable="true"
		role="listitem"
		aria-grabbed={isDragging}
		ondragstart={(event) => {
			isDragging = true;
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData(
				MIME_TYPES.BOOKMARK,
				JSON.stringify({ groupIndex, bookmarkIndex, title, link })
			);
		}}
		ondragend={() => (isDragging = false)}
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
