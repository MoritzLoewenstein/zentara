<script>
	import CloseIcon from './icons/CloseIcon.svelte';

	const { title } = $props();
</script>

<dialog>
	<button title={'close ' + title}><CloseIcon /></button>
</dialog>
