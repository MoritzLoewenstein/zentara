<script>
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
</script>

{#if page?.error?.code === 'unauthorized' || page?.error?.code === 'unauthorized_validation'}
	<h1>Login</h1>
	<form method="POST" action="?/login" use:enhance>
		<label>
			Email
			<input name="email" type="email" placeholder="max.mustermann@example.org" required />
		</label>
		<label>
			Password
			<input name="password" type="password" placeholder="********" required />
		</label>
		{#if page?.error?.code === 'unauthorized_validation'}
			<p class="notice-validation">{page.error.message}</p>
		{/if}
		<button>Log in</button>
		<a href="/?recovery_code=">Forgot password?</a>
	</form>
{:else if page?.error?.code === 'register' || page?.error?.code === 'register_validation'}
	<h1>Register</h1>
	<form method="POST" action="?/register" use:enhance>
		<label>
			Email
			<input name="email" type="email" placeholder="max.mustermann@example.org" required />
		</label>
		<label>
			Password
			<input name="password" type="password" placeholder="********" required />
		</label>
		{#if page?.error?.code === 'register_validation'}
			<p class="notice-validation">{page.error.message}</p>
		{/if}
		<button>Register</button>
	</form>
{:else if page?.error?.code === 'recovery_code' || page?.error?.code === 'recovery_code_validation'}
	<h1>account recovery</h1>
	<form method="POST" action="?/recovery_code" use:enhance>
		<label>
			recovery code
			<input name="recovery_code" type="password" placeholder="1abDUTxxBeteGs9qcBy2CX" required />
		</label>
		<label>
			new password
			<input name="password" type="password" placeholder="********" required />
		</label>
		{#if page?.error?.code === 'recovery_code_validation'}
			<p class="notice-validation">{page.error.message}</p>
		{/if}
		<button>recover account</button>
	</form>
{:else}
	<h1>Error</h1>
	<p>{page.error?.message || 'Something went wrong'}</p>
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
