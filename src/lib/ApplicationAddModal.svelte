<script>
	import { dashboard_view, dashboard_content, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import AddIcon from './icons/AddIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';

	let dialog;
	let iconInput;
	$effect(() => {
		if (dashboard_view.value === DASHBOARD_VIEW.APPLICATION_CREATE) {
			iconInput.value = '';
			dialog.showModal();
		} else {
			dialog.close();
			iconValue = '';
			nameValue = '';
			linkValue = '';
			iconInput.value = '';
		}
	});

	let iconValue = $state('');
	let nameValue = $state('');
	let linkValue = $state('');
	let nameInput;
	let linkInput;

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

	function createApplication() {
		dashboard_content.addApplication(iconValue, nameValue, linkValue);
		dashboard_view.set(DASHBOARD_VIEW.EDIT);
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
		createApplication();
	}
</script>

<dialog bind:this={dialog} onclose={() => dashboard_view.set(DASHBOARD_VIEW.EDIT)}>
	<div class="wrapper">
		<h4>create application</h4>
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
				required
				onkeydown={trySubmit}
			/>
		</label>
		<label>
			icon
			<input
				bind:this={iconInput}
				type="file"
				accept="image/png, image/jpeg, image/svg+xml"
				onchange={handleFileSelection}
			/>
		</label>

		{#if iconValue}
			<div class="icon-preview-wrapper">
				<img src={iconValue} alt="icon file preview" class="icon-preview" />
				<button
					class="btn-small btn-secondary"
					type="button"
					title="remove icon"
					onclick={() => {
						iconValue = '';
						iconInput.value = '';
					}}><CloseIcon /></button
				>
			</div>
		{/if}
		<div class="buttons">
			<button
				type="button"
				title="cancel application creation"
				class="btn-secondary"
				onclick={() => dashboard_view.set(DASHBOARD_VIEW.EDIT)}><CloseIcon /></button
			>
			<button type="button" title="create application" onclick={createApplication}
				><AddIcon /></button
			>
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

	.icon-preview-wrapper {
		position: relative;
		width: max-content;
		padding: 1rem;
	}
	.icon-preview {
		max-width: 100px;
		max-height: 100px;
		object-fit: contain;
		object-position: top left;
		margin-bottom: 2rem;
	}

	.icon-preview-wrapper button {
		position: absolute;
		top: 0;
		right: 0;
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		column-gap: 1rem;
	}
</style>
