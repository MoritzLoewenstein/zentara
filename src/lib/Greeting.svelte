<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		dashboard_view,
		dashboard_content,
		DASHBOARD_VIEW,
		EDIT_VIEWS,
		DASHBOARD_VIEWS
	} from './client/dashboard.svelte.js';
	import LogoutIcon from './icons/LogoutIcon.svelte';
	import SettingsIcon from './icons/SettingsIcon.svelte';
	import EditIcon from './icons/EditIcon.svelte';
	import { resolve } from '$app/paths';

	let date = $state(new Date());
	onMount(() => {
		const interval = setInterval(() => {
			date = new Date();
		}, 1000);

		return () => clearInterval(interval);
	});

	const greeting = $derived.by(() => {
		const hour = date.getHours();
		if (hour < 6) {
			return 'Good night';
		}
		if (hour < 12) {
			return 'Good morning';
		}
		if (hour < 18) {
			return 'Good afternoon';
		}

		return 'Good evening';
	});

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'full',
		timeStyle: 'medium',
		timeZone: 'Europe/Berlin'
	});
	const formattedDate = $derived.by(() => dateFormatter.format(date));

	function setDashboardEdit() {
		dashboard_content.setDashboardEdit();
		dashboard_view.set(DASHBOARD_VIEW.EDIT);
	}
</script>

<hr />
<div>
	<p>{formattedDate}</p>
	{#if page.data.user}
		<button
			onclick={setDashboardEdit}
			title="edit dashboard"
			class="edit"
			class:active={EDIT_VIEWS.includes(dashboard_view.value)}
		>
			<EditIcon />
		</button>
		{#if DASHBOARD_VIEWS.includes(dashboard_view.value)}
			<button
				onclick={() => dashboard_view.set(DASHBOARD_VIEW.SETTINGS)}
				title="settings"
				class="settings"
				class:active={dashboard_view.value === DASHBOARD_VIEW.SETTINGS}
			>
				<SettingsIcon />
			</button>
			<a href={resolve('/logout')} title="logout" class="logout">
				<LogoutIcon />
			</a>
		{/if}
	{/if}
</div>
<svelte:element this={page.status === 401 ? 'h2' : 'h1'} class="greeting">{greeting}</svelte:element
>

<style>
	hr {
		margin: 1rem var(--side-padding);
	}

	div {
		padding: 0 var(--side-padding);
		display: flex;
		flex-direction: row;
		column-gap: 1rem;
		height: 2.5rem;
		box-sizing: border-box;
	}

	div .edit {
		margin-left: auto;
	}

	.edit.active {
		cursor: not-allowed;
	}

	div button,
	div a {
		padding: 0.25rem;
		height: calc(24px + 0.5rem);
		width: calc(24px + 0.5rem);
		box-sizing: border-box;
		color: var(--blue);
		background-color: var(--offwhite);
		border: 1px solid var(--offwhite);
		background-color: none !important;
		transition: var(--color-transition);
	}

	div button:hover,
	div button.active,
	div a:hover {
		color: var(--offwhite);
		background-color: var(--blue);
		border: 1px solid var(--blue);
		background-color: none !important;
	}

	.greeting {
		margin: 0 var(--side-padding) 1.5rem var(--side-padding);
		font-size: 2.25rem;
	}
</style>
