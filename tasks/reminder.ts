import { Task } from 'klasa';
import { DMChannel, TextChannel } from 'discord.js';

/*
 *
 * This is to be used with the remindme command located in
 * /commands/Tools/remindme.js
 *
 */

export default class extends Task {
	async run({ text, channel, user }: { text: string; channel: string; user: string }) {
		const _channel = this.client.channels.get(channel);
		if (_channel && ['dm', 'text'].includes(_channel.type) && (_channel as DMChannel | TextChannel).postable)
			await (_channel as TextChannel | DMChannel).send(`<@${user}> You wanted me to remind you: ${text}`);
	}
}
