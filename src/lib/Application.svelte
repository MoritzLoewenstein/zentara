<script>
	const { name, icon, link } = $props();
	const displayUrl = new URL(link).host;
</script>

<a href={link} target="_blank" rel="noopener noreferrer">
	<img src={icon} alt={name} />
	<p class="name">{name}</p>
	<p class="url">{displayUrl}</p>
</a>

<style>
	a {
		display: grid;
		grid-template-areas: 'icon name' 'icon url';
		height: 50px;
	}

	a:hover {
		text-decoration: none;
	}
	a:hover .name {
		text-decoration: underline;
	}
	a:hover .url {
		text-decoration: none !important;
	}

	img {
		grid-area: icon;
		filter: grayscale(100%);
		height: 50px;
		width: auto;
		object-fit: container;
	}

	.name {
		grid-area: name;
		margin: 0;
	}

	.url {
		grid-area: url;
		text-transform: uppercase;
		margin: 0;
		font-size: 0.65rem;
	}
</style>
