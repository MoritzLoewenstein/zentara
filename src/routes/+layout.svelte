<script>
	import Greeting from '$lib/Greeting.svelte';
	import '$lib/styles/global.css';
</script>

<Greeting />
<main>
	<slot />
</main>
