<script>
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import EditIcon from './icons/EditIcon.svelte';
	const { title, link, groupIndex, itemIndex } = $props();

	function editBookmark() {
		dashboard_content.setBookmarkEdit(groupIndex, itemIndex);
		dashboard_view.set(DASHBOARD_VIEW.BOOKMARK_EDIT);
	}
</script>

{#if EDIT_VIEWS.includes(dashboard_view.value)}
	<div class="bookmark-edit" role="listitem">
		<p>{title}</p>
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

	.bookmark-edit button.edit {
		cursor: pointer;
		margin-left: auto;
	}
</style>
