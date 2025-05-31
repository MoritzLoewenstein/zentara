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
	const { name, icon, link, movePreview, groupIndex, itemIndex } = $props();
	const displayUrl = new URL(link).host;

	let isDragging = $state(false);

	function editApplication() {
		dashboard_content.setApplicationEdit(groupIndex, itemIndex);
		dashboard_view.set(DASHBOARD_VIEW.APPLICATION_EDIT);
	}
</script>

{#if EDIT_VIEWS.includes(dashboard_view.value)}
	<div
		class="application-edit"
		class:movePreview
		class:moving={isDragging}
		class:noIcon={!icon}
		draggable="true"
		role="listitem"
		aria-grabbed={isDragging}
		ondragstart={(event) => {
			// prevent applicationGroup from being dragged
			event.stopPropagation();
			isDragging = true;
			dashboard_content.setMove(MOVE_TYPES.APPLICATION, groupIndex, itemIndex);
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData(
				MOVE_TYPES.APPLICATION,
				JSON.stringify({ groupIndex, itemIndex, name, icon, link })
			);
		}}
		ondragend={() => {
			isDragging = false;
			dashboard_content.resetMovePreview();
			dashboard_content.resetMove();
		}}
	>
		{#if icon}
			<img src={icon} alt={name} />
		{/if}
		<p class="name">{name}</p>
		<p class="url">{displayUrl}</p>
		<button type="button" title="move application '{name}'" class="btn-small btn-secondary move"
			><MoveIcon /></button
		>
		<button
			type="button"
			title="edit application '{name}'"
			class="btn-small btn-secondary edit"
			onclick={editApplication}><EditIcon /></button
		>
	</div>
{:else}
	<a href={link} class:noIcon={!icon} target="_blank" rel="noopener noreferrer">
		{#if icon}
			<img src={icon} alt={name} />
		{/if}
		<p class="name">{name}</p>
		<p class="url">{displayUrl}</p>
	</a>
{/if}

<style>
	a {
		display: grid;
		grid-template-areas: 'icon name' 'icon url';
		gap: 0.5rem;
		height: 50px;

		&.noIcon {
			grid-template-areas: 'name' 'url';
		}
	}

	.application-edit {
		cursor: move;
		display: grid;
		grid-template-areas: 'icon name btn-move' 'icon url btn-edit';
		gap: 0.5rem;

		&.noIcon {
			grid-template-areas: 'name btn-move' 'url btn-edit';
		}
	}

	.application-edit.moving:not(.movePreview) {
		border: 1px dashed var(--blue);
		opacity: 0.5;
	}

	.application-edit.movePreview {
		opacity: 0.5;
	}

	.application-edit button.move {
		grid-area: btn-move;
	}

	.application-edit button.edit {
		grid-area: btn-edit;
	}

	a:hover {
		text-decoration: none;
	}
	a:hover .name {
		text-decoration: underline;
	}
	a:hover .url {
		text-decoration: none !important;
	}

	img {
		grid-area: icon;
		height: 50px;
		width: auto;
		object-fit: container;
	}

	.name {
		grid-area: name;
		margin: 0;
	}

	.url {
		grid-area: url;
		text-transform: uppercase;
		margin: 0;
		font-size: 0.65rem;
	}
</style>
