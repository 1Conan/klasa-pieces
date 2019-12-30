import { Event, Colors } from 'klasa';
import { RateLimitData } from 'discord.js';


const HEADER = new Colors({ text: 'red' }).format('[RATELIMIT]');

export default class extends Event {
	run({ timeout, limit, method, route }: RateLimitData) {
		this.client.emit('verbose', [
			HEADER,
			`Timeout: ${timeout}ms`,
			`Limit: ${limit} requests`,
			`Method: ${method.toUpperCase()}`,
			`Route: ${route}`,
		].join('\n'));
	}
}
