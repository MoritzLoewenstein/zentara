<script>
	import AddIcon from './icons/AddIcon.svelte';
	import { dashboard_view, DASHBOARD_VIEW, EDIT_VIEWS } from './settings.svelte';
	const { title, children } = $props();

	let titleValue = $state(title);
	const dashboard_edit = $derived(EDIT_VIEWS.includes(dashboard_view.value));
</script>

<section>
	{#if dashboard_edit}
		<input type="text" bind:value={titleValue} class="group-title" />
	{:else}
		<h3 class="group-title">{title}</h3>
	{/if}
	<div class="items">
		{@render children?.()}
		{#if dashboard_edit}
			<button
				type="button"
				title="add bookmark"
				class="btn-secondary bookmark-add"
				onclick={() => dashboard_view.set(DASHBOARD_VIEW.BOOKMARK_CREATE)}
			>
				<AddIcon />
			</button>
		{/if}
	</div>
</section>

<style>
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
