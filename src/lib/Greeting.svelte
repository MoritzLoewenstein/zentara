<script>
	import { onMount } from 'svelte';
	import { page } from "$app/state";

	let editMode = $state(false);
	let settingsVisible = $state(false);
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

	const dateFormatter = new Intl.DateTimeFormat('de-DE', {
		dateStyle: 'full',
		timeStyle: 'medium',
		timeZone: 'Europe/Berlin'
	});
	const formattedDate = $derived.by(() => dateFormatter.format(date));
</script>

<hr />
<div>
	<p>{formattedDate}</p>
	{#if page.data.user}
	<button onclick={(editMode = !editMode)} title="Edit Dashboard" class="edit" class:active={editMode}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
		>
			<!-- Pencil tip and body -->
			<path d="M16.5 3.5L20.5 7.5 8 20l-4 1 1-4z" />
			<!-- Underline or accent line -->
			<path d="M12 20h9" />
		</svg>
	</button>
	<button onclick={(settingsVisible = true)} title="Settings" class="settings" class:active={settingsVisible}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
		>
			<!-- Center circle -->
			<circle cx="12" cy="12" r="3" />
			<!-- Gear “teeth” -->
			<path
				d="M12 2v2M12 20v2M20 12h2M2 12H4M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41"
			/>
		</svg>
	</button>
	<a href="/logout" title="Logout" class="logout">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			fill="none"
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
		>
			<!-- Door -->
			<path d="M9 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h4" />
			<!-- Arrow pointing out -->
			<path d="M16 7l5 5-5 5" />
			<path d="M21 12H9" />
		</svg>
	</a>
	{/if}

</div>
<h1>{greeting}</h1>

<style>
	h1 {
		margin-top: 0;
	}

	div {
		display: flex;
		flex-direction: row;
		column-gap: 1rem;
	}

	div .edit {
		margin-left: auto;
	}

	div button, div a {
		margin-top: 0.75rem;
		padding: 0.25rem;
		height: calc(24px + 0.5rem);
		width: calc(24px + 0.5rem);
		box-sizing: border-box;
		color: var(--blue);;
  		background-color: var(--offwhite);
  		border: 1px solid var(--offwhite);
		background-color: none !important;
		transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
	}

	div button:hover, div button.active, div a:hover {
		color: var(--offwhite);;
  		background-color: var(--blue);
  		border: 1px solid var(--blue);
		background-color: none !important;
	}

</style>
