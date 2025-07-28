<script>
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import EditIcon from './icons/EditIcon.svelte';
	import MoveIcon from './icons/MoveIcon.svelte';
	import {
		draggable,
		dropTargetForElements
	} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
	import { onDestroy } from 'svelte';

	const { title, link, groupIndex, itemIndex } = $props();
	let dragElement = $state();
	let dropIndicator = $state({ before: false, after: false });

	function editBookmark() {
		dashboard_content.setBookmarkEdit(groupIndex, itemIndex);
		dashboard_view.set(DASHBOARD_VIEW.BOOKMARK_EDIT);
	}

	let cleanup = () => {};
	$effect(() => {
		if (dragElement) {
			const cleanupDrag = draggable({
				element: dragElement,
				canDrag: () => EDIT_VIEWS.includes(dashboard_view.value),
				getInitialData: () => ({
					type: 'bookmark',
					groupIndex,
					itemIndex,
					bookmark: { title, link }
				})
			});

			const cleanupDrop = dropTargetForElements({
				element: dragElement,
				canDrop: ({ source }) => {
					return source.data.type === 'bookmark' && EDIT_VIEWS.includes(dashboard_view.value);
				},
				getData: ({ input }) => ({
					type: 'bookmark-item',
					groupIndex,
					itemIndex,
					edge: input.closestEdgeOfTarget
				}),
				onDragEnter: ({ source, self }) => {
					if (source.data.type === 'bookmark') {
						const edge = self.data.edge;
						dropIndicator.before = edge === 'top';
						dropIndicator.after = edge === 'bottom';
						console.log('Drag entered', dropIndicator, self.data);
					}
				},
				onDragLeave: () => {
					dropIndicator.before = false;
					dropIndicator.after = false;
				},
				onDrop: ({ source, self }) => {
					const sourceData = source.data;
					const targetData = self.data;

					if (sourceData.type === 'bookmark' && targetData.type === 'bookmark-item') {
						const fromGroupIndex = sourceData.groupIndex;
						const fromItemIndex = sourceData.itemIndex;
						const toGroupIndex = targetData.groupIndex;
						let toItemIndex = targetData.itemIndex;

						// Adjust index based on edge
						if (targetData.edge === 'bottom') {
							toItemIndex += 1;
						}

						dashboard_content.moveBookmark(
							fromGroupIndex,
							fromItemIndex,
							toGroupIndex,
							toItemIndex
						);
					}

					dropIndicator.before = false;
					dropIndicator.after = false;
				}
			});

			cleanup = () => {
				cleanupDrag();
				cleanupDrop();
			};
		} else {
			cleanup();
			cleanup = () => {};
		}
	});

	onDestroy(() => {
		cleanup();
	});
</script>

{#if EDIT_VIEWS.includes(dashboard_view.value)}
	<div class="bookmark-wrapper">
		{#if dropIndicator.before}
			<div class="drop-indicator"></div>
		{/if}
		<div class="bookmark-edit" role="listitem" bind:this={dragElement}>
			<button type="button" title="move bookmark '{title}'" class="btn-small btn-secondary move"
				><MoveIcon /></button
			>
			<p>{title}</p>
			<button
				type="button"
				title="edit bookmark '{title}'"
				class="btn-small btn-secondary edit"
				onclick={editBookmark}><EditIcon /></button
			>
		</div>
		{#if dropIndicator.after}
			<div class="drop-indicator"></div>
		{/if}
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

	.bookmark-edit button.move {
		cursor: grab;
	}

	.bookmark-edit button.move:active {
		cursor: grabbing;
	}

	.drop-indicator {
		height: 2px;
		background: var(--blue);
		border-radius: 1px;
		margin: 2px 0;
		opacity: 0.8;
		animation: pulse 1s ease-in-out infinite alternate;
	}

	@keyframes pulse {
		from {
			opacity: 0.4;
		}
		to {
			opacity: 1;
		}
	}
</style>
