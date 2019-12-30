import { Argument, util, Possible, KlasaMessage } from 'klasa';
import { GuildMember, User, Guild } from 'discord.js';

const { userOrMember: USER_REGEXP } = Argument.regex;

function resolveMember(query: GuildMember | User | string, guild: Guild): Promise<GuildMember | null> {
	if (query instanceof GuildMember) return Promise.resolve(query);
	if (query instanceof User) return guild.members.fetch(query.id).catch(() => null);
	if (typeof query === 'string') {
		if (USER_REGEXP.test(query)) return guild.members.fetch(query).catch(() => null);
		if (/\w{1,32}#\d{4}/.test(query)) {
			const res = guild.members.find((member) => member.user.tag.toLowerCase() === query.toLowerCase());
			return Promise.resolve(res ? res : null);
		}
	}
	return Promise.resolve(null);
}

export default class extends Argument {
	async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<GuildMember> {
		if (!msg.guild) throw 'This command can only be used inside of a guild';
		const resUser = await resolveMember(arg, msg.guild);
		if (resUser) return resUser;

		const results: GuildMember[] = [];
		const reg = new RegExp(util.regExpEsc(arg), 'i');
		for (const member of msg.guild.members.values())
			if (reg.test(member.user.username)) results.push(member);


		let querySearch: GuildMember[];
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${util.regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter((member) => regWord.test(member.user.username));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw `${possible.name} Must be a valid name, id or user mention`;
			case 1: return querySearch[0];
			default: throw `Found multiple matches: \`${querySearch.map((member) => member.user.tag).join('`, `')}\``;
		}
	}
}
