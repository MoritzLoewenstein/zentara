<script lang="ts">
	import { dashboard_view, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import ExternalLink from './icons/ExternalLink.svelte';
	import polarflowLogo from './brands/polar_flow.svg';
	import stravaLogo from './brands/strava.svg';
	import { resolve } from '$app/paths';
	import type { OAuthProvider } from './server/oauth_connection';
	import { page } from '$app/state';
	import { disconnectProvider } from './functions/oauth.remote';
	import CloseIcon from './icons/CloseIcon.svelte';
	import { toast } from './client/toast.svelte';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import InfoDismissible from './InfoDismissible.svelte';
	import polarflow from '$lib/client/polarflow.js';
	import strava from '$lib/client/strava.js';

	let oauth_success = $state('');
	onMount(() => {
		const url = new URL(window.location.toString());
		const oauth_success_search = url.searchParams.get('oauth_success');
		if (oauth_success_search && ['polarflow', 'strava'].includes(oauth_success_search)) {
			oauth_success = oauth_success_search;
			dashboard_view.set(DASHBOARD_VIEW.SETTINGS);
			url.searchParams.delete('oauth_success');
			history.pushState(null, '', url);
		}
	});

	let polar_connection = $derived(
		page.data.oauth_connections.find(
			(conn: { provider: OAuthProvider }) => conn.provider === 'polarflow'
		)
	);

	let strava_connection = $derived(
		page.data.oauth_connections.find(
			(conn: { provider: OAuthProvider }) => conn.provider === 'strava'
		)
	);

	let polarUser = $derived.by(() => {
		if (!polar_connection) {
			return { primary: '', secondary: '' };
		}

		return polarflow.profileToBasic(polar_connection.externalAccountInfo);
	});

	let stravaUser = $derived.by(() => {
		if (!strava_connection) {
			return { primary: '', secondary: '' };
		}

		return strava.profileToBasic(strava_connection.externalAccountInfo);
	});
</script>

<section class="account-connections">
	<h3>connect accounts</h3>
	<InfoDismissible title={`${oauth_success} connection successful!`} show={!!oauth_success} />
	<img src={polarflowLogo} alt="" />
	{#if polar_connection}
		<div class="account">
			<p>{polarUser.primary}<br />{polarUser.secondary}</p>
			<button
				class="btn-secondary btn-icon"
				aria-label="disconnect polarflow"
				onclick={async () => {
					try {
						await disconnectProvider('polarflow');
						await invalidateAll();
					} catch (error) {
						console.error(error);
						toast.add('Something went wrong!');
					}
				}}><CloseIcon /></button
			>
		</div>
	{:else}
		<a
			aria-label="connect polarflow"
			class="btn btn-secondary btn-icon"
			href={resolve('/oauth/polarflow/authorize')}><ExternalLink /></a
		>
	{/if}
	<img src={stravaLogo} alt="" />
	{#if strava_connection}
		<div class="account">
			<p>
				{stravaUser.primary}{#if stravaUser.secondary}<br />{stravaUser.secondary}{/if}
			</p>
			<button
				class="btn-secondary btn-icon"
				aria-label="disconnect strava"
				onclick={async () => {
					try {
						await disconnectProvider('strava');
						await invalidateAll();
					} catch (error) {
						console.error(error);
						toast.add('Something went wrong!');
					}
				}}><CloseIcon /></button
			>
		</div>
	{:else}
		<a
			aria-label="connect strava"
			class="btn btn-secondary btn-icon"
			href={resolve('/oauth/strava/authorize')}><ExternalLink /></a
		>
	{/if}
</section>

<style>
	section {
		display: grid;
		grid-template-columns: 2fr 1.75fr;
		flex-direction: column;
		row-gap: 1rem;
		align-items: center;

		& h3 {
			grid-column: span 2;
			margin-top: 1rem;
			margin-bottom: 0rem;
		}

		& > :global(p) {
			grid-column: span 2;
		}

		& > img {
			width: 70%;
			max-height: 50px;
			object-fit: contain;
			object-position: left;
		}

		& > a {
			margin-left: auto;
			place-self: center;
		}

		& .account {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			column-gap: 1rem;
			width: 100%;

			& p {
				text-transform: uppercase;
				font-size: 12px;
			}
		}
	}
</style>
