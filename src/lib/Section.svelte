<script>
	import { dashboard_view, dashboard_content, EDIT_VIEWS } from './client/dashboard.svelte.js';
	import { getInsertIndex, getClosestItemIndex, MOVE_TYPES } from './client/draggable.js';
	import AddIcon from './icons/AddIcon.svelte';
	const { title, children, type } = $props();

	let group_items_container;

	const isRow = type !== 'applications';

	const supportedDragTypes = [MOVE_TYPES.APPLICATION_GROUP, MOVE_TYPES.BOOKMARK_GROUP];

	function getDragType(event) {
		return supportedDragTypes.find((type) => event.dataTransfer.types.includes(type));
	}

	function onDragEnter(event) {
		if (!getDragType(event)) {
			return;
		}
		event.preventDefault();
	}

	function onDragOver(event) {
		const dragType = getDragType(event);
		if (!dragType) {
			return;
		}
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';

		const insertIndex =
			dragType === MOVE_TYPES.BOOKMARK_GROUP
				? getClosestItemIndex(group_items_container, event.clientX, event.clientY)
				: getInsertIndex(group_items_container, event.clientY);
		const hidePreview =
			insertIndex === null || dashboard_content.value.move.group_index === insertIndex;
		console.log('hidePreview', hidePreview, insertIndex);
		if (hidePreview) {
			dashboard_content.resetMovePreview();
		} else {
			dashboard_content.updateMovePreview(insertIndex);
		}
	}

	function onDragLeave(event) {
		if (!getDragType(event)) {
			return;
		}
		dashboard_content.resetMovePreview();
	}

	function onDrop(event) {
		const dragType = getDragType(event);
		if (!dragType) {
			return;
		}
		event.preventDefault();

		const group_data = JSON.parse(event.dataTransfer.getData(dragType));
		const insertIndex =
			dragType === MOVE_TYPES.BOOKMARK_GROUP
				? getClosestItemIndex(group_items_container, event.clientX, event.clientY)
				: getInsertIndex(group_items_container, event.clientY);
		dashboard_content.resetMovePreview();
		dashboard_content.resetMove();
		dashboard_content.moveItem(dragType, group_data, insertIndex);
	}
</script>

<section
	class:isRow
	role="list"
	ondragenter={(e) => onDragEnter(e)}
	ondragover={(e) => onDragOver(e)}
	ondragleave={(e) => onDragLeave(e)}
	ondrop={(e) => onDrop(e)}
>
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
	<div class="items" bind:this={group_items_container}>
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
