<script>
	import ApplicationAddModal from '$lib/ApplicationAddModal.svelte';
	import BookmarkAddModal from '$lib/BookmarkAddModal.svelte';
	import BookmarkEditModal from '$lib/BookmarkEditModal.svelte';
	import Toast from '$lib/Toast.svelte';
	import IntroModal from '$lib/IntroModal.svelte';
	import SaveDashboardModal from '$lib/SaveDashboardModal.svelte';
	import SettingsModal from '$lib/SettingsModal.svelte';
	import ApplicationEditModal from '$lib/ApplicationEditModal.svelte';
</script>

<Toast></Toast>
<SettingsModal></SettingsModal>
<IntroModal></IntroModal>
<SaveDashboardModal></SaveDashboardModal>
<ApplicationAddModal></ApplicationAddModal>
<ApplicationEditModal></ApplicationEditModal>
<BookmarkAddModal></BookmarkAddModal>
<BookmarkEditModal></BookmarkEditModal>
