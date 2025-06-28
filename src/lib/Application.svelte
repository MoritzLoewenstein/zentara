<script>
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS
	} from './client/dashboard.svelte.js';
	import EditIcon from './icons/EditIcon.svelte';
	const { name, icon, link, groupIndex, itemIndex } = $props();
	const displayUrl = new URL(link).host;

	function editApplication() {
		dashboard_content.setApplicationEdit(groupIndex, itemIndex);
		dashboard_view.set(DASHBOARD_VIEW.APPLICATION_EDIT);
	}
</script>

{#if EDIT_VIEWS.includes(dashboard_view.value)}
	<div class="application-edit" class:noIcon={!icon} role="listitem">
		{#if icon}
			<img src={icon} alt={name} />
		{/if}
		<p class="name">{name}</p>
		<p class="url">{displayUrl}</p>
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
		display: grid;
		grid-template-areas: 'icon name btn-edit' 'icon url btn-edit';
		gap: 0.5rem;

		&.noIcon {
			grid-template-areas: 'name btn-edit' 'url btn-edit';
		}
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
