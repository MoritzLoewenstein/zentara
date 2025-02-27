<script>
	import { dashboard_view, dashboard_content, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import DeleteIcon from './icons/DeleteIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';

	let dialog;
	$effect(() => {
		if (dashboard_view.value === DASHBOARD_VIEW.APPLICATION_EDIT) {
			dialog.showModal();
		} else {
			dialog.close();
			iconValue = '';
			nameValue = '';
			linkValue = '';
		}
	});

	const application = dashboard_content.getApplicationEdit();
	let iconValue = $state(application.icon);
	let nameValue = $state(application.name);
	let linkValue = $state(application.link);
	$effect(() => {
		const app = dashboard_content.getApplicationEdit();
		iconValue = app.icon;
		nameValue = app.name;
		linkValue = app.link;
	});
	let nameInput;
	let linkInput;

	function saveApplication() {
		dashboard_content.saveApplicationEdit(iconValue, nameValue, linkValue);
		dashboard_view.set(DASHBOARD_VIEW.EDIT);
	}
	function deleteApplication() {
		const confirmDelete = confirm('Are you sure you want to delete this application?');
		if (!confirmDelete) return;
		dashboard_content.deleteApplicationEdit();
		dashboard_view.set(DASHBOARD_VIEW.EDIT);
	}

	function handleFileSelection(event) {
		const file = event.target.files[0];
		iconValue = '';

		if (!file) {
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			iconValue = reader.result;
		};
		reader.onerror = (err) => {
			console.error(err);
		};
		reader.readAsDataURL(file);
	}

	function trySubmit(event) {
		if (event.key !== 'Enter') {
			return;
		}
		if (!nameValue) {
			nameInput.reportValidity();
			return;
		}
		if (!linkValue) {
			linkInput.reportValidity();
			return;
		}
		saveApplication();
	}
</script>

<dialog bind:this={dialog} onclose={() => dashboard_view.set(DASHBOARD_VIEW.EDIT)}>
	<div class="wrapper">
		<h4>edit application</h4>
		<label>
			name
			<input
				type="text"
				bind:this={nameInput}
				bind:value={nameValue}
				placeholder="grafana"
				required
				onkeydown={trySubmit}
			/>
		</label>
		<label>
			link
			<input
				type="url"
				bind:this={linkInput}
				bind:value={linkValue}
				placeholder="https://grafana.example.org"
				onkeydown={trySubmit}
			/>
		</label>
		<label>
			icon
			<input
				type="file"
				accept="image/png, image/jpeg, image/svg+xml"
				onchange={handleFileSelection}
			/>
		</label>
		{#if iconValue}
			<img src={iconValue} alt="icon file preview" class="icon-preview" />
		{/if}
		<div class="buttons">
			<button
				type="button"
				title="delete application"
				class="btn-danger delete"
				onclick={deleteApplication}><DeleteIcon /></button
			>
			<button
				type="button"
				title="cancel application edit"
				class="btn-secondary cancel"
				onclick={() => dashboard_view.set(DASHBOARD_VIEW.EDIT)}><CloseIcon /></button
			>
			<button type="button" title="save application" onclick={saveApplication}><SaveIcon /></button>
		</div>
	</div>
</dialog>

<style>
	dialog .wrapper {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
	}

	h4 {
		margin: 0;
	}

	label {
		display: flex;
		flex-direction: column;
	}

	.icon-preview {
		max-width: 100px;
		max-height: 100px;
		object-fit: contain;
		object-position: top left;
		margin-bottom: 2rem;
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		column-gap: 1rem;
	}

	.buttons .cancel {
		margin-left: auto;
	}
</style>
