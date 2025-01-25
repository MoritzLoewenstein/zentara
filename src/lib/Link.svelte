<script>
	const { title, link } = $props();
</script>

<a href={link} target="_blank" rel="noopener noreferrer">
	{title}
</a>

<style>
	a {
	}

	a:hover {
		text-decoration: underline;
	}
</style>
