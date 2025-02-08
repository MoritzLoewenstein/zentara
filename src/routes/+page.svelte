<script>
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { dashboard_view, dashboard_content, EDIT_VIEWS } from '$lib/client/dashboard.svelte.js';
	import Application from '$lib/Application.svelte';
	import ApplicationAddModal from '$lib/ApplicationAddModal.svelte';
	import ApplicationGroup from '$lib/ApplicationGroup.svelte';
	import Bookmark from '$lib/Bookmark.svelte';
	import BookmarkAddModal from '$lib/BookmarkAddModal.svelte';
	import BookmarkEditModal from '$lib/BookmarkEditModal.svelte';
	import BookmarkGroup from '$lib/BookmarkGroup.svelte';
	import Toast from '$lib/Toast.svelte';
	import IntroModal from '$lib/IntroModal.svelte';
	import SaveDashboardModal from '$lib/SaveDashboardModal.svelte';
	import Section from '$lib/Section.svelte';
	import SettingsModal from '$lib/SettingsModal.svelte';
	import ApplicationEditModal from '$lib/ApplicationEditModal.svelte';
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

<Toast></Toast>
<SettingsModal></SettingsModal>
<IntroModal></IntroModal>
<SaveDashboardModal></SaveDashboardModal>
<ApplicationAddModal></ApplicationAddModal>
<ApplicationEditModal></ApplicationEditModal>
<BookmarkAddModal></BookmarkAddModal>
<BookmarkEditModal></BookmarkEditModal>
<Section title="Applications" type="applications">
	{#each dashboard_config.applicationGroups as applicationGroup, groupIndex}
		<ApplicationGroup title={applicationGroup.title} {groupIndex}>
			{#each applicationGroup.applications as application, applicationIndex}
				<Application {...application} {groupIndex} {applicationIndex} />
			{/each}
		</ApplicationGroup>
	{/each}
</Section>
<Section title="Bookmarks" type="bookmarks">
	{#each dashboard_config.bookmarkGroups as bookmarkGroup, groupIndex}
		<BookmarkGroup title={bookmarkGroup.title} {groupIndex}>
			{#each bookmarkGroup.bookmarks as bookmark, bookmarkIndex}
				<Bookmark {...bookmark} {groupIndex} {bookmarkIndex} />
			{/each}
		</BookmarkGroup>
	{/each}
</Section>
