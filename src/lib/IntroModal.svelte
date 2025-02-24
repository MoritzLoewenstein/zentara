<script>
	import { page } from '$app/state';
	import { dashboard_view, DASHBOARD_VIEW } from './client/dashboard.svelte.js';
	import CloseIcon from './icons/CloseIcon.svelte';
	import { onMount } from 'svelte';
	import UserInviteSection from './UserInviteSection.svelte';
	import RecoveryCodeSection from './RecoveryCodeSection.svelte';

	let dialog;
	$effect(() => {
		if (dashboard_view.value === DASHBOARD_VIEW.INTRO) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});
	onMount(() => {
		if (page.data.first_login) {
			dashboard_view.set(DASHBOARD_VIEW.INTRO);
		}
	});
</script>

<dialog bind:this={dialog}>
	<div class="wrapper">
		<button
			class="close"
			title="close intro"
			onclick={() => dashboard_view.set(DASHBOARD_VIEW.DASHBOARD)}
		>
			<CloseIcon />
		</button>
		<h1>intro</h1>
		<RecoveryCodeSection
			recovery_codes={page.data.recovery_codes}
			recovery_code_count={page.data.recovery_code_count}
		/>
		{#if page.data.user.is_admin}
			<UserInviteSection />
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
</style>
