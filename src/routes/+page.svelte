<script>
	import Application from '$lib/Application.svelte';
	import ApplicationGroup from '$lib/ApplicationGroup.svelte';
	import Link from '$lib/Link.svelte';
	import LinkGroup from '$lib/LinkGroup.svelte';
	import Section from '$lib/Section.svelte';

	import plausible from '$lib/icons/plausible.png';
</script>

<Section title="Applications">
	<ApplicationGroup title="Monitoring">
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
	</ApplicationGroup>
	<ApplicationGroup title="Monitoring">
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
	</ApplicationGroup>
	<ApplicationGroup title="Monitoring">
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
		<Application name="Plausible" link="https://plausible.monilo.org" icon={plausible} />
	</ApplicationGroup>
</Section>

<Section title="Links" isRow={true}>
	<LinkGroup title="Social">
		<Link title="Twitter" link="https://x.com/home" />
		<Link title="Twitter" link="https://x.com/home" />
		<Link title="Twitter" link="https://x.com/home" />
	</LinkGroup>
	<LinkGroup title="Social">
		<Link title="Twitter" link="https://x.com/home" />
		<Link title="Twitter" link="https://x.com/home" />
		<Link title="Twitter" link="https://x.com/home" />
	</LinkGroup>
	<LinkGroup title="Social">
		<Link title="Twitter" link="https://x.com/home" />
		<Link title="Twitter" link="https://x.com/home" />
		<Link title="Twitter" link="https://x.com/home" />
	</LinkGroup>
</Section>
