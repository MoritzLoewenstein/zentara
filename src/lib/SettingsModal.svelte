<script>
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { dashboard_view, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import { PUBLIC_APP_NAMESPACE } from '$env/static/public';
	import { invalidateAll } from '$app/navigation';
	import AddIcon from './icons/AddIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';
	import RefreshIcon from './icons/RefreshIcon.svelte';
	import CopyIcon from './icons/CopyIcon.svelte';
	import SaveIcon from './icons/SaveIcon.svelte';

	let dialog;
	$effect(async () => {
		if (dashboard_view.value === DASHBOARD_VIEW.SETTINGS) {
			dialog.showModal();
		} else {
			// reset page.form to prevent showing recovery codes again
			await invalidateAll();
			dialog.close();
		}
	});

	const recoveryCodes = $derived(page.form?.recovery_codes || []);
	const recoveryCodeCount = $derived(
		page.form?.recovery_code_count || page.data.recovery_code_count || 0
	);
	const openInvites = $derived(page.form?.user_invites || page.data.user_invites || []);
</script>

<dialog bind:this={dialog}>
	<div class="wrapper">
		<button
			class="close"
			title="close settings"
			onclick={() => dashboard_view.set(DASHBOARD_VIEW.DASHBOARD)}
		>
			<CloseIcon />
		</button>
		<h1>settings</h1>
		<label
			>email (readonly)
			<input type="text" readonly value={page.data.user.email} disabled />
		</label>
		<label
			>role (readonly)
			<input type="text" readonly value={page.data.user.is_admin ? 'admin' : 'user'} disabled />
		</label>
		<section class="recovery-codes">
			<h3>recovery codes</h3>
			<p>
				Recovery codes are used to recovery your account in case you lose your access. Save these
				codes in a safe place.<br />Each code can only be used once.
			</p>
			<p>You have {recoveryCodeCount} account recovery codes left.</p>
			{#if page.form === null || (page.status !== 200 && page.form.code === 'recovery_codes_validation')}
				<form action="?/recovery_codes" method="post" use:enhance>
					{#if page.status != 200}
						<p class="notice-validation">{page.form.message}</p>
					{/if}
					<label>
						password
						<input type="password" placeholder="********" name="password" required />
					</label>
					<button type="submit">
						<span>regenerate recovery codes</span>
						<RefreshIcon />
					</button>
				</form>
			{:else if recoveryCodes.length > 0}
				<p class="recovery-code-text">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html recoveryCodes.join('<br>')}
					<button
						title="copy recovery codes"
						class="recover-code-copy"
						onclick={() => navigator.clipboard.writeText(recoveryCodes.join('\n'))}
						><CopyIcon />
					</button>
					<button
						title="download recovery codes"
						class="recovery-code-download"
						onclick={() => {
							const blob = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
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
			{/if}
		</section>
		{#if page.data.user.is_admin}
			<section class="user-invites">
				<h3>open user invites</h3>
				{#if openInvites.length > 0}
					<table>
						<thead>
							<tr>
								<th class="email heading">email</th>
								<th class="link heading">link</th>
							</tr>
						</thead>
						<tbody>
							{#each openInvites as invite (invite.email)}
								<tr>
									<td class="email"><a href="mailto:{invite.email}">{invite.email}</a></td>
									<td class="link">
										<button
											onclick={async () => {
												await navigator.clipboard.writeText(invite.link);
											}}
											title="copy invite link of {invite.email}"
										>
											<CopyIcon />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{:else}
					<p>no open invites</p>
				{/if}
			</section>
			<section class="user-invites-create">
				<h3>create invite link</h3>
				<p>Invitations will expire after 14 days. Invited users only see their own dashboard.</p>
				<form action="?/invite" method="post" use:enhance>
					{#if page.status != 200 && page.form.code === 'invite_validation'}
						<p class="notice-validation">{page.form.message}</p>
					{/if}
					<label>
						email
						<input type="email" name="email" required placeholder="alexius@example.org" />
					</label>
					<button type="submit">
						<span>create invite</span>
						<AddIcon />
					</button>
				</form>
			</section>
		{/if}
	</div>
</dialog>

<style>
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

	h1 {
		margin: 0;
	}

	p {
		font-size: 14px;
	}

	p.notice-validation {
		border: 2px solid var(--orange);
		width: max-content;
		padding: 0.25rem 0.5rem;
		background: var(--orange);
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

	.recovery-codes p + form {
		margin-top: 0.5rem;
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

	table .email {
		width: auto;
	}

	table .link {
		/* hardcoded button width */
		width: 58px;
	}

	table .email a {
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		max-width: 100%;
		display: inline-block;
	}
</style>
