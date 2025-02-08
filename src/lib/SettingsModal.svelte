<script>
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import AddIcon from './icons/AddIcon.svelte';
	import CloseIcon from './icons/CloseIcon.svelte';
	import CopyIcon from './icons/CopyIcon.svelte';
	import RefreshIcon from './icons/RefreshIcon.svelte';
	import { dashboard_view, DASHBOARD_VIEW } from './client/dashboard.svelte.js';

	let dialog;
	$effect(() => {
		if (dashboard_view.value === DASHBOARD_VIEW.SETTINGS) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	const recoveryCodeCount = page.data.recovery_code_count ?? 0;
	const openInvites = page.data.user_invites ?? [];
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
			<form action="?/recovery-codes" method="post" use:enhance>
				<label>
					password
					<input type="password" placeholder="********" required />
				</label>
				<button type="submit">
					<span>regenerate recovery codes</span>
					<RefreshIcon />
				</button>
			</form>
		</section>
		{#if page.data.user.is_admin}
			<section class="user-invites">
				<h3>open user invites</h3>
				{#if openInvites.length > 0}
					<table>
						<caption>open user invites</caption>
						<thead>
							<tr>
								<th>email</th>
								<th>link</th>
							</tr>
						</thead>
						<tbody>
							{#each openInvites as invite}
								<tr>
									<td>{invite.email}</td>
									<td>
										<button
											onclick={async () => {
												await navigator.clipboard.writeText(invite.link);
											}}
											title="copy invite link of {invite.email}"
										>
											<span>{invite.link}</span>
											<CopyIcon />
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
					<ul>
						{#each openInvites as invite}
							<li>{invite.email}</li>
						{/each}
					</ul>
				{:else}
					<p>no open invites</p>
				{/if}
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
</style>
