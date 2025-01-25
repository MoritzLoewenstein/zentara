<script>
	const { title, children } = $props();
</script>

<section>
	<h3>{title}</h3>
	<div class="items">
		{@render children?.()}
	</div>
</section>

<style>
	section {
	}

	h3 {
		margin-top: 0;
	}

	.items {
		display: flex;
		flex-direction: column;
	}
</style>
