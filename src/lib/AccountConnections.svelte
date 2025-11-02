<script lang="ts">
	import ExternalLink from './icons/ExternalLink.svelte';
	import polarflow from './brands/polar_flow.svg';
	import strava from './brands/strava.svg';
	import { resolve } from '$app/paths';
</script>

<section class="account-connections">
	<h3>connect accounts</h3>
	<img src={polarflow} alt="" />
	<a
		aria-label="connect polarflow"
		class="btn-secondary btn-icon"
		href={resolve('/oauth/polarflow')}><ExternalLink /></a
	>
	<img src={strava} alt="" />
	<a aria-label="connect strava" class="btn-secondary btn-icon" href={resolve('/oauth/strava')}
		><ExternalLink /></a
	>
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
