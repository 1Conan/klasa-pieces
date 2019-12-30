// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
import { Guild, Role } from 'discord.js';
import { Argument, KlasaMessage, Possible, util } from 'klasa';

const ROLE_REGEXP = Argument.regex.role;

function resolveRole(query: Role | string, guild: Guild) {
	if (query instanceof Role) return guild.roles.has(query.id) ? query : null;
	if (typeof query === 'string' && ROLE_REGEXP.test(query)) return guild.roles.get((ROLE_REGEXP.exec(query) as RegExpExecArray)[1]);
	return null;
}

export default class extends Argument {
	async run(arg: string, possible: Possible, msg: KlasaMessage): Promise<Role> {
		if (!msg.guild) return this.store.get('role').run(arg, possible, msg);
		const resRole = resolveRole(arg, msg.guild);
		if (resRole) return resRole;

		const results = [];
		const reg = new RegExp(util.regExpEsc(arg), 'i');
		for (const role of msg.guild.roles.values()) if (reg.test(role.name)) results.push(role);

		let querySearch;
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${util.regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter((role) => regWord.test(role.name));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw `${possible.name} Must be a valid name, id or role mention`;
			case 1: return querySearch[0];
			default:
				if (querySearch[0].name.toLowerCase() === arg.toLowerCase()) return querySearch[0];
				throw `Found multiple matches: \`${querySearch.map((role) => role.name).join('`, `')}\``;
		}
	}
}
