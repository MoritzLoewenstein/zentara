<script lang="ts">
	import { getContext, onMount } from 'svelte';
	let { children } = $props();

	const PAGER_API = getContext('PAGER_API');
	if (!PAGER_API) {
		throw new Error('<Page> must be used inside a <Pages> component.');
	}

	onMount(() => {
		PAGER_API.register();
		return () => {
			PAGER_API.unregister();
		};
	});
</script>

<div class="page-item">
	{@render children?.()}
</div>

<style>
	.page-item {
		width: 100dvw;
		flex-shrink: 0;
		padding: 0 var(--side-padding);
		box-sizing: border-box;
		scroll-snap-align: center;
		scroll-snap-stop: always;
	}
</style>
