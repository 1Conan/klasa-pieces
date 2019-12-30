import { Finalizer, KlasaMessage } from 'klasa';

/*
 * Add to your schema definition:
 * KlasaClient.defaultGuildSchema.add('deleteCommand', 'boolean', { default: false });
 */

export default class extends Finalizer {
	async run(msg: KlasaMessage) {
		if (msg.guild && msg.guild.settings.get('deleteCommand') && msg.deletable) await msg.delete();
	}
}
