<script>
	const { title, children, isRow = false } = $props();
</script>

<section class:isRow>
	<h2>{title}</h2>
	<div class="items">
		{@render children?.()}
	</div>
</section>

<style>
	section {
		margin-top: 4rem;
	}
	section.isRow .items {
		flex-direction: row;
		row-gap: 0;
		column-gap: 8rem;
	}

	.items {
		display: flex;
		flex-direction: column;
		row-gap: 4rem;
	}
</style>
