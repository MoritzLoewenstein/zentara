<script>
	import { page } from '$app/state';
	import { enhance } from '$app/forms';

	let email = $state('');
</script>

{#if page?.error?.code === 'unauthorized' || page?.form?.code === 'unauthorized_validation'}
	<h1>login</h1>
	<form method="POST" action="?/login" use:enhance>
		<label>
			email
			<input
				name="email"
				type="email"
				placeholder="max.mustermann@example.org"
				required
				bind:value={email}
			/>
		</label>
		<label>
			password
			<input name="password" type="password" placeholder="********" required />
		</label>
		{#if page?.form?.code === 'unauthorized_validation'}
			<p class="notice-validation">{page.form.message}</p>
		{/if}
		<button>Log in</button>
		<a href="/?recovery_code=">forgot password?</a>
	</form>
{:else if page?.error?.code === 'register' || page?.form?.code === 'register_validation'}
	<h1>register</h1>
	<form method="POST" action="?/register" use:enhance>
		<label>
			email
			<input
				name="email"
				type="email"
				placeholder="max.mustermann@example.org"
				required
				bind:value={email}
			/>
		</label>
		<label>
			password
			<input name="password" type="password" placeholder="********" required />
		</label>
		{#if page?.form?.code === 'register_validation'}
			<p class="notice-validation">{page.form.message}</p>
		{/if}
		<button>register</button>
	</form>
{:else if page?.error?.code === 'recovery_code' || page?.form?.code === 'recovery_code_validation'}
	<h1>account recovery</h1>
	<form method="POST" action="?/recovery_code" use:enhance>
		<label>
			email
			<input
				name="email"
				type="email"
				placeholder="max.mustermann@example.org"
				required
				bind:value={email}
			/>
		</label>
		<label>
			recovery code
			<input name="recovery_code" type="password" placeholder="1abDUTxxBeteGs9qcBy2CX" required />
		</label>
		<label>
			new password
			<input name="password" type="password" placeholder="********" required />
		</label>
		{#if page?.form?.code === 'recovery_code_validation'}
			<p class="notice-validation">{page.form.message}</p>
		{/if}
		<button>recover account</button>
		<a href="/">login</a>
	</form>
{:else if page?.error?.code === 'invite_token' || page?.error?.code === 'invite_token_validation' || page?.form?.code === 'invite_token_validation'}
	<h1>register (invited)</h1>
	<form method="POST" action="?/register_invite" use:enhance>
		<label>
			invite token
			<input name="invite_token" type="text" required readonly value={page.error.invite_token} />
		</label>
		<label>
			email
			<input name="email" type="email" required readonly value={page.error.email} />
		</label>
		<label>
			password
			<input name="password" type="password" placeholder="********" required />
		</label>
		{#if page?.error?.code === 'invite_token_validation'}
			<p class="notice-validation">{page.error.message}</p>
		{:else if page?.form?.code === 'invite_token_validation'}
			<p class="notice-validation">{page.form.message}</p>
		{/if}
		<button>register</button>
	</form>
{:else}
	<h1>Error</h1>
	<p>{page.error?.message || page.form?.message || 'Something went wrong'}</p>
{/if}

<style>
	form {
		display: grid;
		gap: 1em;
		max-width: 500px;
	}
	label {
		display: grid;
		gap: 0.5em;
	}
	button {
		padding: 0.5em;
	}

	p.notice-validation {
		border: 2px solid var(--orange);
		width: max-content;
		padding: 0.25rem 0.5rem;
		background: var(--orange);
	}
</style>
