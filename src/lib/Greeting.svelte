<script>
	import { onMount } from "svelte";
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
	const formattedDate = $derived.by(() =>dateFormatter.format(date));
</script>

<hr />
<p>{formattedDate}</p>
<h1>{greeting}</h1>

<style>
	h1 {
		margin-top: 0;
	}
</style>
