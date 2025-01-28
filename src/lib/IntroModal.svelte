<script>
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { PUBLIC_APP_NAMESPACE } from '$env/static/public';
	import { dashboard_state, DASHBOARD_STATES } from './settings.svelte';
	import CopyIcon from './icons/CopyIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';
	import AddIcon from './icons/AddIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';
	import { onMount } from 'svelte';

	let dialog;
	$effect(() => {
		if (dashboard_state.state === DASHBOARD_STATES.INTRO) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});
	onMount(() => {
		if (page.data.first_login) {
			dashboard_state.set(DASHBOARD_STATES.INTRO);
		}
	});
</script>

<dialog bind:this={dialog}>
	<div class="wrapper">
		<button
			class="close"
			title="close intro modal"
			onclick={() => dashboard_state.set(DASHBOARD_STATES.DEFAULT)}
		>
			<CloseIcon />
		</button>
		<h1>intro</h1>
		<section class="recovery-codes">
			<h3>recovery codes</h3>
			<p>
				Recovery codes are used to recovery your account in case you lose your access. Save these
				codes in a safe place.<br />Each code can only be used once, and will not be shown again.
			</p>
			<p class="recovery-code-text">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html page.data.recovery_codes.join('<br>')}
				<button
					title="copy recovery codes"
					class="recover-code-copy"
					onclick={() => navigator.clipboard.writeText(page.data.recovery_codes.join('\n'))}
					><CopyIcon />
				</button>
				<button
					title="download recovery codes"
					class="recovery-code-download"
					onclick={() => {
						const blob = new Blob([page.data.recovery_codes.join('\n')], { type: 'text/plain' });
						const url = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = `${PUBLIC_APP_NAMESPACE}-recovery-codes.txt`;
						a.click();
						URL.revokeObjectURL(url);
					}}
				>
					<SaveIcon />
				</button>
			</p>
		</section>
		<section class="user-invites-create">
			<h3>create invite link</h3>
			<p>Invitations will expire after 14 days. Invited users only see their own dashboard.</p>
			<form action="?/invite" method="post" use:enhance>
				<label>
					email
					<input type="email" required placeholder="alexius@example.org" />
				</label>
				<button type="submit">
					<span>create invite</span>
					<AddIcon />
				</button>
			</form>
		</section>
	</div>
</dialog>

<style>
	dialog {
		width: min(100%, 400px);
	}

	dialog .wrapper {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
		position: relative;
	}

	button.close {
		position: absolute;
		top: 0;
		right: 0;
	}

	.recovery-code-text {
		font-family: monospace;
		letter-spacing: 0.2rem;
		position: relative;
		line-height: 1.5rem;
	}

	.recover-code-copy {
		position: absolute;
		top: 0;
		right: 0;
	}

	.recovery-code-download {
		position: absolute;
		top: calc(1rem + 46px);
		right: 0;
	}

	h1 {
		margin: 0;
	}

	p {
		font-size: 14px;
	}

	label {
		display: flex;
		flex-direction: column;
		font-size: 14px;
	}

	form {
		display: flex;
		flex-direction: column;
		row-gap: 0.5rem;
	}

	form button {
		display: flex;
		flex-direction: row;
		align-items: center;
		width: max-content;
		column-gap: 1rem;
	}

	h3 {
		margin-top: 1rem;
		margin-bottom: 0.25rem;
	}

	section {
		display: flex;
		flex-direction: column;
		row-gap: 0.5rem;
	}
</style>
