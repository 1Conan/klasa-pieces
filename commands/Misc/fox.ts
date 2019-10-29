import { Command, CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import fetch from 'node-fetch';

export default class extends Command {

  constructor(client: KlasaClient, store: CommandStore, file: string[], dir: string) {
		super(client, store, file, dir, {
			aliases: ['randomfox'],
			description: 'Grabs a random fox image from randomfox.ca',
			extendedHelp: 'This command grabs a random fox from "https://randomfox.ca/floof/".',
		});
	}

	async run(msg: KlasaMessage) {
		const url = await fetch('https://randomfox.ca/floof/')
			.then(response => response.json())
			.then(body => body.image);
		return msg.channel.sendFile(url);
	}

}