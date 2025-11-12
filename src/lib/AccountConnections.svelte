<script lang="ts">
	import { dashboard_view, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import ExternalLink from './icons/ExternalLink.svelte';
	import polarflow from './brands/polar_flow.svg';
	import strava from './brands/strava.svg';
	import { resolve } from '$app/paths';
	import type { OAuthProvider } from './server/oauth_connection';
	import { page } from '$app/state';
	import { disconnectProvider } from './functions/oauth.remote';
	import CloseIcon from './icons/CloseIcon.svelte';
	import { toast } from './client/toast.svelte';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import InfoDismissible from './InfoDismissible.svelte';

	let oauth_success = $state('');
	onMount(() => {
		const searchParams = new URLSearchParams(window.location.search);
		const oauth_success_search = searchParams.get('oauth_success');
		if (oauth_success_search && ['polarflow', 'strava'].includes(oauth_success_search)) {
			oauth_success = oauth_success_search;
			dashboard_view.set(DASHBOARD_VIEW.SETTINGS);
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
			return { name: '', birthday: '' };
		}

		const firstName = polar_connection.externalAccountInfo['first-name'];
		const lastName = polar_connection.externalAccountInfo['last-name'];
		const name = `${firstName.slice(0, 1)}. ${lastName}`;
		const birthday = polar_connection.externalAccountInfo.birthdate.split('-').reverse().join('-');
		return { name, birthday };
	});
</script>

<section class="account-connections">
	<h3>connect accounts</h3>
	<InfoDismissible title={`${oauth_success} connection successful!`} show={!!oauth_success} />
	<img src={polarflow} alt="" />
	{#if polar_connection}
		<div class="account">
			<p>{polarUser.name}<br />{polarUser.birthday}</p>
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
	<img src={strava} alt="" />
	{#if strava_connection}
		<p>strava connected</p>
	{:else}
		<a
			aria-label="connect strava"
			class="btn btn-secondary btn-icon"
			href={resolve('/oauth/strava')}><ExternalLink /></a
		>
	{/if}
</section>

<style>
	section {
		display: grid;
		grid-template-columns: 2fr 1.5fr;
		flex-direction: column;
		row-gap: 0.5rem;
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
			justify-content: end;
			align-items: top;
			column-gap: 1rem;
			width: 100%;

			& p {
				text-transform: uppercase;
				font-size: 12px;
			}
		}
	}
</style>
