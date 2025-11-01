<script>
	import Dashboard from '$lib/Dashboard.svelte';
	import Modals from '$lib/Modals.svelte';
	import Page from '$lib/Page.svelte';
	import Pages from '$lib/Pages.svelte';
</script>

<Modals />
<Pages>
	<Page>
		<Dashboard />
	</Page>
	<Page>Seite 2</Page>
	<Page>Seite 3</Page>
</Pages>
