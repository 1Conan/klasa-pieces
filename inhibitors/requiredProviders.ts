import { Inhibitor, KlasaMessage, Command } from 'klasa';

declare module 'klasa' {
	interface Command {
		requiredProviders: string[];
	}
}

export default class extends Inhibitor {
	async run(_msg: KlasaMessage, cmd: Command) {
		if (!cmd.requiredProviders || !cmd.requiredProviders.length) return false;
		const providers = cmd.requiredProviders.filter((provider) => !this.client.providers.has(provider));
		if (!providers.length) throw `The client is missing the **${providers.join(', ')}** provider${providers.length > 1 ? 's' : ''} and cannot run.`;
		return false;
	}
}
