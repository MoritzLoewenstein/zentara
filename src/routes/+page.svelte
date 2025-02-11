<script>
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { dashboard_view, dashboard_content, EDIT_VIEWS } from '$lib/client/dashboard.svelte.js';
	import ApplicationGroup from '$lib/ApplicationGroup.svelte';
	import BookmarkGroup from '$lib/BookmarkGroup.svelte';
	import Section from '$lib/Section.svelte';
	import Modals from '$lib/Modals.svelte';

	/**@typedef {import('../lib/server/dashboard').Dashboard} Dashboard */

	/**@type {Dashboard} */
	let dashboard_config = $state(page.data.dashboard);
	if (browser) {
		dashboard_content.update({
			dashboard: page.data.dashboard,
			dashboard_edit: page.data.dashboard
		});
	}

	$effect(() => {
		dashboard_config = EDIT_VIEWS.includes(dashboard_view.value)
			? dashboard_content.value.dashboard_edit
			: dashboard_content.value.dashboard;
	});
</script>

<Modals />
<Section title="Applications" type="applications">
	{#each dashboard_config.applicationGroups as applicationGroup, groupIndex (applicationGroup)}
		<ApplicationGroup {...applicationGroup} {groupIndex} />
	{/each}
</Section>
<Section title="Bookmarks" type="bookmarks">
	{#each dashboard_config.bookmarkGroups as bookmarkGroup, groupIndex (bookmarkGroup)}
		<BookmarkGroup {...bookmarkGroup} {groupIndex} />
	{/each}
</Section>
