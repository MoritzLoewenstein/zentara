<script lang="ts">
	import { setContext } from 'svelte';
	import { dashboard_view, EDIT_VIEWS } from './client/dashboard.svelte.js';
	import ArrowIcon from './icons/ArrowIcon.svelte';
	import { page_idx } from './client/page.svelte.js';

	let { children } = $props();

	let clientwidth = $state(0);
	let pagecount = $state(0);
	let sliderEl = $state<HTMLDivElement>();
	const PAGER_API = {
		register: () => pagecount++,
		unregister: () => pagecount--
	};
	setContext('PAGER_API', PAGER_API);

	$effect(() => {
		sliderEl?.scroll({
			left: clientwidth * page_idx.value
		});
	});

	function handleKeydown(ev: KeyboardEvent) {
		if (ev.key === 'ArrowLeft') {
			ev.preventDefault();
			if (page_idx.value > 0) {
				page_idx.set(page_idx.value - 1);
			} else {
				triggerBounce('left');
			}
		} else if (ev.key === 'ArrowRight') {
			ev.preventDefault();
			if (page_idx.value < pagecount - 1) {
				page_idx.set(page_idx.value + 1);
			} else {
				triggerBounce('right');
			}
		}
	}

	function triggerBounce(direction: 'left' | 'right') {
		const OVERSCROLL_PX = 50;
		if (!sliderEl || sliderEl.style.transform !== '') return;

		const transformValue =
			direction === 'left' ? `translateX(${OVERSCROLL_PX}px)` : `translateX(-${OVERSCROLL_PX}px)`;

		sliderEl.style.transform = transformValue;
		setTimeout(() => {
			if (sliderEl) sliderEl.style.transform = '';
		}, 100);
	}
</script>

<svelte:document onkeydown={handleKeydown} />
<main>
	<div class="slider" bind:clientWidth={clientwidth} bind:this={sliderEl}>
		{@render children?.()}
	</div>

	<div class="pagination" class:visible={!EDIT_VIEWS.includes(dashboard_view.value)}>
		<div></div>
		<button
			aria-label="Previous Page"
			onclick={() => {
				if (page_idx.value > 0) {
					page_idx.set(page_idx.value - 1);
				} else {
					triggerBounce('left');
				}
			}}><ArrowIcon /></button
		>
		<button
			aria-label="Next Page"
			onclick={() => {
				if (page_idx.value < pagecount - 1) {
					page_idx.set(page_idx.value + 1);
				} else {
					triggerBounce('right');
				}
			}}><ArrowIcon /></button
		>
	</div>
</main>

<style>
	main {
		overflow: clip;
		& > .slider {
			display: flex;
			flex-direction: row;
			transition: transform 0.4s ease-out;
			overflow-x: scroll;
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
			scroll-behavior: smooth;
		}

		& > .pagination {
			position: fixed;
			/* horizontal center of save dashboard dialog */
			bottom: 3.4375rem;
			left: 50%;
			transform: translateX(-50%);
			display: flex;
			flex-direction: row;
			align-items: center;
			column-gap: 1rem;
			opacity: 0;
			pointer-events: none;
			transition: opacity ease-out 0.2s;

			&.visible {
				opacity: 1;
				pointer-events: all;
			}

			@media (hover: none) {
				opacity: 0 !important;
				pointer-events: none !important;
			}

			& > button,
			& > div {
				height: 2rem;
				width: 2rem;
				background-color: transparent;
				border: 2px solid var(--blue);
				box-sizing: border-box;
				padding: 0;
			}

			& > button {
				display: grid;
				place-items: center;
				transition: transform 0.1s ease-out;
				transition-delay: 2s;
				:global(& > svg) {
					color: var(--blue);
				}
				&:first-of-type {
					order: 0;
					transform: translateX(calc(100% + 1rem));
					:global(& > svg) {
						transform: rotate(180deg);
					}
				}

				&:last-of-type {
					order: 2;
					transform: translateX(calc(-100% - 1rem));
				}
			}

			& > div {
				order: 1;
				z-index: 5;
				position: relative;

				&::before {
					content: '';
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translateX(-50%) translateY(-50%);
					width: 1rem;
					height: 1rem;
					border-radius: 50%;
					background-color: var(--blue);
				}

				&:hover ~ button {
					transform: translateX(0) !important;
					transition-delay: 0s;
				}
			}
		}
	}
</style>
