import { Argument, util, Possible, KlasaMessage } from 'klasa';
import { Channel, Message, Guild, GuildChannel } from 'discord.js';

const { channel: CHANNEL_REGEXP } = Argument.regex;

function resolveChannel(query: Channel | Message | string, guild: Guild): GuildChannel | null {
	if (query instanceof Channel) return guild.channels.has(query.id) ? guild.channels.get(query.id)! : null;
	if (query instanceof Message) return query.guild!.id === guild.id ? guild.channels.get(query.channel.id) || null : null;
	if (typeof query === 'string' && CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)![1]) || null;
	return null;
}

export default class extends Argument {
	async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<GuildChannel> {
		if (!msg.guild) return this.store.get('channel').run(arg, possible, msg);
		const resChannel = resolveChannel(arg, msg.guild);
		if (resChannel) return resChannel;

		const results: GuildChannel[] = [];
		const reg = new RegExp(util.regExpEsc(arg), 'i');
		for (const channel of msg.guild.channels.values())
			if (reg.test(channel.name)) results.push(channel);


		let querySearch: GuildChannel[];
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${util.regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter((channel) => regWord.test(channel.name));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw `${possible.name} Must be a valid name, id or channel mention`;
			case 1: return querySearch[0];
			default: throw `Found multiple matches: \`${querySearch.map((channel) => channel.name).join('`, `')}\``;
		}
	}
}
