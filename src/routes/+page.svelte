<script>
	import Application from '$lib/Application.svelte';
	import ApplicationAddModal from '$lib/ApplicationAddModal.svelte';
	import ApplicationGroup from '$lib/ApplicationGroup.svelte';
	import Bookmark from '$lib/Bookmark.svelte';
	import BookmarkAddModal from '$lib/BookmarkAddModal.svelte';
	import BookmarkEditModal from '$lib/BookmarkEditModal.svelte';
	import BookmarkGroup from '$lib/BookmarkGroup.svelte';
	import SaveDashboardModal from '$lib/SaveDashboardModal.svelte';
	import Section from '$lib/Section.svelte';
	import AddIcon from '$lib/icons/AddIcon.svelte';
	import CloseIcon from '$lib/icons/CloseIcon.svelte';
	import DeleteIcon from '$lib/icons/DeleteIcon.svelte';
	import EditIcon from '$lib/icons/EditIcon.svelte';
	import LogoutIcon from '$lib/icons/LogoutIcon.svelte';
	import MoveIcon from '$lib/icons/MoveIcon.svelte';
	import SaveIcon from '$lib/icons/SaveIcon.svelte';
	import SettingsIcon from '$lib/icons/SettingsIcon.svelte';
	import UploadIcon from '$lib/icons/UploadIcon.svelte';

	import plausible from '$lib/icons/plausible.png';
</script>

<SaveDashboardModal></SaveDashboardModal>
<ApplicationAddModal></ApplicationAddModal>
<BookmarkAddModal></BookmarkAddModal>
<BookmarkEditModal></BookmarkEditModal>
<Section title="Icons" isRow={true}>
	<AddIcon />
	<CloseIcon />
	<DeleteIcon />
	<EditIcon />
	<LogoutIcon />
	<MoveIcon />
	<SaveIcon />
	<SettingsIcon />
	<UploadIcon />
</Section>
<Section title="Applications">
	<ApplicationGroup title="Monitoring">
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
	</ApplicationGroup>
	<ApplicationGroup title="Monitoring">
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
	</ApplicationGroup>
	<ApplicationGroup title="Monitoring">
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
	</ApplicationGroup>
</Section>

<Section title="Bookmarks" isRow={true}>
	<BookmarkGroup title="Social">
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
	</BookmarkGroup>
	<BookmarkGroup title="Social">
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
	</BookmarkGroup>
	<BookmarkGroup title="Social">
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
	</BookmarkGroup>
	<BookmarkGroup title="Social">
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
	</BookmarkGroup>
	<BookmarkGroup title="Social">
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
	</BookmarkGroup>
	<BookmarkGroup title="Social">
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
	</BookmarkGroup>
	<BookmarkGroup title="Social">
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
	</BookmarkGroup>
	<BookmarkGroup title="Social">
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
	</BookmarkGroup>
	<BookmarkGroup title="Social">
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
		<Bookmark title="Twitter" link="https://x.com/home" />
	</BookmarkGroup>
</Section>
