<script>
	import AddIcon from './icons/AddIcon.svelte';
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import DeleteIcon from './icons/DeleteIcon.svelte';
	import Application from './Application.svelte';

	const { title, groupIndex, items } = $props();
	const uid = $props.id();

	const dashboard_edit = $derived(EDIT_VIEWS.includes(dashboard_view.value));
	let titleValue = $state(title);

	$effect(() => {
		dashboard_content.setApplicationGroupTitle(groupIndex, titleValue);
	});

	function createApplication() {
		dashboard_content.setApplicationAdd(groupIndex);
		dashboard_view.set(DASHBOARD_VIEW.APPLICATION_CREATE);
	}

	function deleteApplicationGroup() {
		const confirmDelete = confirm(
			`Are you sure you want to delete the application group '${titleValue}' ?`
		);
		if (!confirmDelete) return;
		dashboard_content.deleteApplicationGroup(groupIndex);
	}
</script>

<section class="group" role="listitem" aria-owns="{uid}-list">
	{#if dashboard_edit}
		<div class="group-heading">
			<input type="text" bind:value={titleValue} class="group-title" />
			<button
				type="button"
				title="delete application group '{titleValue}'"
				class="btn-small btn-danger delete"
				onclick={deleteApplicationGroup}><DeleteIcon /></button
			>
		</div>
	{:else}
		<h3 class="group-title">{title}</h3>
	{/if}

	<div id="{uid}-list" class="items" role="group">
		{#each items as application, itemIndex (application)}
			<Application {...application} {groupIndex} {itemIndex} />
		{/each}
		{#if dashboard_edit}
			<button
				type="button"
				title="add application to group '{titleValue}'"
				class="btn-secondary"
				onclick={createApplication}
			>
				<AddIcon />
			</button>
		{/if}
	</div>
</section>

<style>
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
		margin-bottom: 1em;
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
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: flex-start;
		column-gap: 4rem;
		row-gap: 4rem;
	}
</style>
