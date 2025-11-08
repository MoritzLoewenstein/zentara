<script lang="ts">
	import ExternalLink from './icons/ExternalLink.svelte';
	import polarflow from './brands/polar_flow.svg';
	import strava from './brands/strava.svg';
	import { resolve } from '$app/paths';
	import type { OAuthProvider } from './server/oauth_connection';
	import { page } from '$app/state';
	import { disconnectProvider } from './functions/oauth.remote';
	import CloseIcon from './icons/CloseIcon.svelte';
	import { toast } from './client/toast.svelte';

	function isConnected(provider: OAuthProvider) {
		const connection = page.data.oauth_connections.find(
			(conn: { provider: OAuthProvider }) => conn.provider === provider
		);
		return !!connection;
	}
</script>

<section class="account-connections">
	<h3>connect accounts</h3>
	<img src={polarflow} alt="" />
	{#if isConnected('polarflow')}
		<button
			aria-label="disconnect polarflow"
			onclick={async () => {
				try {
					await disconnectProvider('polarflow');
				} catch (error) {
					console.error(error);
					toast.add('Something went wrong!');
				}
			}}><CloseIcon /></button
		>
	{:else}
		<a
			aria-label="connect polarflow"
			class="btn-secondary btn-icon"
			href={resolve('/oauth/polarflow/authorize')}><ExternalLink /></a
		>
	{/if}
	<img src={strava} alt="" />
	{#if isConnected('strava')}
		<p>strava connected</p>
	{:else}
		<a aria-label="connect strava" class="btn-secondary btn-icon" href={resolve('/oauth/strava')}
			><ExternalLink /></a
		>
	{/if}
</section>

<style>
	section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		flex-direction: column;
		row-gap: 0.75rem;
		align-items: center;
	}

	h3 {
		grid-column: span 2;
		margin-top: 1rem;
		margin-bottom: 0rem;
	}

	img {
		width: 70%;
		height: auto;
	}

	img,
	a {
		&:not(:first-of-type) {
			margin-top: 1rem;
		}
	}

	a {
		width: max-content;
		place-self: center;
	}
</style>
