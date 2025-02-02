<script>
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import EditIcon from './icons/EditIcon.svelte';
	import MoveIcon from './icons/MoveIcon.svelte';
	const { title, link, groupIndex, bookmarkIndex } = $props();

	function editBookmark() {
		dashboard_content.setBookmarkEdit(groupIndex, bookmarkIndex);
		dashboard_view.set(DASHBOARD_VIEW.BOOKMARK_EDIT);
	}
</script>

{#if EDIT_VIEWS.includes(dashboard_view.value)}
	<div class="bookmark-edit" draggable="true">
		<p>{title}</p>
		<button
			type="button"
			title="move bookmark"
			class="btn-secondary move"
			onclick={() => dashboard_view.set(DASHBOARD_VIEW.BOOKMARK_CREATE)}><MoveIcon /></button
		>
		<button type="button" title="edit bookmark" class="btn-secondary edit" onclick={editBookmark}
			><EditIcon /></button
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

	.bookmark-edit button {
		height: 24px;
		width: 24px;
		padding: 2px;
	}

	.bookmark-edit button :global(svg) {
		width: 100%;
		height: auto;
		display: block;
	}

	.bookmark-edit button.move {
		margin-left: auto;
		cursor: move;
	}

	.bookmark-edit button.edit {
		cursor: pointer;
	}
</style>
