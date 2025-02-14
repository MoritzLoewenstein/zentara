<script>
	import AddIcon from './icons/AddIcon.svelte';
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import { getClosestItemIndex, MOVE_TYPES } from './client/draggable';
	import DeleteIcon from './icons/DeleteIcon.svelte';
	import MoveIcon from './icons/MoveIcon.svelte';
	import Application from './Application.svelte';

	const { title, groupIndex, movePreview, items } = $props();
	const uid = $props.id();

	let applications_container;

	let isDragging = $state(false);

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

	function applicationDragEnter(event) {
		const isApplication = event.dataTransfer.types.includes(MOVE_TYPES.APPLICATION);
		if (!isApplication) return;
		event.preventDefault();
	}

	function applicationDragOver(event) {
		const isApplication = event.dataTransfer.types.includes(MOVE_TYPES.APPLICATION);
		if (!isApplication) return;
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';

		const insertIndex = getClosestItemIndex(applications_container, event.clientX, event.clientY);
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

	function applicationDragLeave(event) {
		const isApplication = event.dataTransfer.types.includes(MOVE_TYPES.APPLICATION);
		if (!isApplication) return;
		dashboard_content.resetMovePreview();
	}

	function applicationDrop(event) {
		const isApplication = event.dataTransfer.types.includes(MOVE_TYPES.APPLICATION);
		if (!isApplication) return;
		event.preventDefault();

		const application_data = JSON.parse(event.dataTransfer.getData(MOVE_TYPES.APPLICATION));
		const insertIndex = getClosestItemIndex(applications_container, event.clientX, event.clientY);
		dashboard_content.resetMovePreview();
		dashboard_content.resetMove();
		dashboard_content.moveItem(MOVE_TYPES.APPLICATION, application_data, groupIndex, insertIndex);
	}
</script>

<section
	class="group"
	draggable={dashboard_edit}
	class:moving={isDragging}
	class:movePreview
	role="listitem"
	aria-grabbed={isDragging}
	aria-owns="{uid}-list"
	ondragstart={(event) => {
		isDragging = true;
		dashboard_content.setMove(MOVE_TYPES.APPLICATION_GROUP, groupIndex);
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData(
			MOVE_TYPES.APPLICATION_GROUP,
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
				onclick={deleteApplicationGroup}><DeleteIcon /></button
			>
		</div>
	{:else}
		<h3 class="group-title">{title}</h3>
	{/if}

	<div
		id="{uid}-list"
		class="items"
		role="group"
		bind:this={applications_container}
		ondragenter={(e) => applicationDragEnter(e)}
		ondragover={(e) => applicationDragOver(e)}
		ondragleave={(e) => applicationDragLeave(e)}
		ondrop={(e) => applicationDrop(e)}
	>
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
