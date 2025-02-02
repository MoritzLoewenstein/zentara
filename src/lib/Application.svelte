<script>
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import EditIcon from './icons/EditIcon.svelte';
	import MoveIcon from './icons/MoveIcon.svelte';
	import plausible from '$lib/icons/plausible.png';
	const { name, icon, link, groupIndex, applicationIndex } = $props();
	const displayUrl = new URL(link).host;

	function editApplication() {
		dashboard_content.setApplicationEdit(groupIndex, applicationIndex);
		dashboard_view.set(DASHBOARD_VIEW.APPLICATION_EDIT);
	}
</script>

{#if EDIT_VIEWS.includes(dashboard_view.value)}
	<div class="application-edit" draggable="true">
		<img src={icon || plausible} alt={name} />
		<p class="name">{name}</p>
		<p class="url">{displayUrl}</p>
		<button type="button" title="move application" class="btn-small btn-secondary move"
			><MoveIcon /></button
		>
		<button
			type="button"
			title="edit application"
			class="btn-small btn-secondary edit"
			onclick={editApplication}><EditIcon /></button
		>
	</div>
{:else}
	<a href={link} target="_blank" rel="noopener noreferrer">
		<img src={icon || plausible} alt={name} />
		<p class="name">{name}</p>
		<p class="url">{displayUrl}</p>
	</a>
{/if}

<style>
	a {
		display: grid;
		grid-template-areas: 'icon name' 'icon url';
		height: 50px;
	}

	.application-edit {
		display: grid;
		grid-template-areas: 'icon name btn-move' 'icon url btn-edit';
		gap: 0.5rem;
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
		filter: grayscale(100%);
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
