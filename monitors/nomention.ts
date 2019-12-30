// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import { ClientUser, TextChannel } from 'discord.js';
import { KlasaClient, KlasaMessage, Monitor, MonitorStore } from 'klasa';

export default class extends Monitor {
	constructor(client: KlasaClient, store: MonitorStore, file: string[], dir: string) {
		super(client, store, file, dir, {
			enabled: true,
			ignoreSelf: true,
			name: 'nomention',
		});
	}

	run(msg: KlasaMessage) {
		if (msg.channel.type !== 'text') return;
		const user = `${msg.author.tag} (${msg.author.id})`;
		const channel = `#${(msg.channel as TextChannel).name} (${msg.channel.id}) from ${msg.guild.name}`;

		if (msg.mentions.everyone) this.client.emit('log', `${user} mentioned everyone in ${channel}`);
		else if (msg.mentions.users.has((this.client.user as ClientUser).id)) this.client.emit('log', `${user} mentioned you in ${channel}`);
	}
}
