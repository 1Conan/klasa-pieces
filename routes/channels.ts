import { Route, RouteStore, DashboardClient, KlasaIncomingMessage } from 'klasa-dashboard-hooks';
import { ServerResponse } from 'http';

export default class extends Route {
	constructor(client: DashboardClient, store: RouteStore, file: string[], directory: string) {
		super(client, store, file, directory, { route: 'guilds/:guildID/channels' });
	}

	get(request: KlasaIncomingMessage, response: ServerResponse): void {
		const { guildID } = request.params;
		const guild = this.client.guilds.get(guildID);
		if (!guild) return response.end('[]');
		return response.end(JSON.stringify(guild.channels.keyArray()));
	}
}
