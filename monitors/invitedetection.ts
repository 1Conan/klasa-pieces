// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import { KlasaClient, KlasaMessage, Monitor, MonitorStore } from 'klasa';
/*
 * Add to your schema definition:
 * KlasaClient.defaultGuildSchema.add('antiinvite', 'boolean', { default: false });
 */

export default class extends Monitor {
	constructor(client: KlasaClient, store: MonitorStore, file: string[], dir: string) {
		super(client, store, file, dir, {
			enabled: true,
			ignoreSelf: true,
			ignoreOthers: false,
		});
	}

	async run(msg: KlasaMessage) {
		if (!msg.guild || !msg.guild.settings.get('antiinvite')) return null;
		if (await msg.hasAtLeastPermissionLevel(6)) return null;
		if (!/(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(msg.content)) return null;
		return msg.delete()
			.catch((err) => this.client.emit('log', err, 'error'));
	}
}
