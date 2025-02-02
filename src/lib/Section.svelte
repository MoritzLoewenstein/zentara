<script>
	import { dashboard_view, dashboard_content, EDIT_VIEWS } from './client/dashboard.svelte.js';
	import AddIcon from './icons/AddIcon.svelte';
	const { title, children, type } = $props();

	const isRow = type !== 'applications';
</script>

<section class:isRow>
	{#if EDIT_VIEWS.includes(dashboard_view.value)}
		<div class="section-edit">
			<h2>{title}</h2>
			{#if type === 'bookmarks'}
				<button
					type="button"
					title="add bookmark group"
					class="btn-secondary"
					onclick={() => dashboard_content.addBookmarkGroup()}><AddIcon /></button
				>
			{:else if type === 'applications'}
				<button
					type="button"
					title="add application group"
					class="btn-secondary"
					onclick={() => dashboard_content.addApplicationGroup()}><AddIcon /></button
				>
			{/if}
		</div>
	{:else}
		<h2>{title}</h2>
	{/if}
	<div class="items">
		{@render children?.()}
	</div>
</section>

<style>
	section {
		margin-top: 4rem;
	}

	.section-edit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	section.isRow .items {
		flex-direction: row;
		row-gap: 0;
		column-gap: 8rem;
		row-gap: 4rem;
		flex-wrap: wrap;
	}

	.items {
		display: flex;
		flex-direction: column;
		row-gap: 6rem;
	}
</style>
