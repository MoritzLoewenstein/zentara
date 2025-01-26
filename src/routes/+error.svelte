<script>
	import { page } from '$app/state';
</script>

{#if page?.error?.code === 'unauthorized'}
	<h1>Login</h1>
	<form method="POST" action="?/login">
		<label>
			Email
			<input name="email" type="email" placeholder="max.mustermann@example.org" required />
		</label>
		<label>
			Password
			<input name="password" type="password" placeholder="********" required />
		</label>
		<button>Log in</button>
	</form>
{:else if page?.error?.code === 'unauthorized_first_user'}
	<h1>Register</h1>
	<form method="POST" action="?/register">
		<label>
			Email
			<input name="email" type="email" placeholder="max.mustermann@example.org" required />
		</label>
		<label>
			Password
			<input name="password" type="password" placeholder="********" required />
		</label>
		<button>Register</button>
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
	input {
		padding: 0.5em;
	}
	button {
		padding: 0.5em;
	}
</style>
