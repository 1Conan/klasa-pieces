import { User, GuildMember, Collection, TextChannel, Guild, Message, Channel } from 'discord.js';
import { Extendable, KlasaClient, ExtendableStore } from 'klasa';

export interface Blocker {
	blocksMe(context: { guild: Guild | null, channel: Channel }): Promise<boolean | undefined>;
	_blocksMeInGuild(guild: Guild, contextChannel?: TextChannel): Promise<boolean | undefined>;
}

declare module 'discord.js' {
	export interface User extends Blocker {}
	export interface GuildMember extends Blocker {}
}

const EMOJI_ID = '🤖';

export default class extends Extendable {

	constructor(client: KlasaClient, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [User, GuildMember] });
	}

	async blocksMe(this: User | GuildMember,
			context: { guild: Guild | null, channel: Channel }): Promise<boolean | undefined> {
		const user = (this as GuildMember).user || this;

		if (user.id === this.client.user!.id) return false;

		const { dmChannel } = user;
		if (dmChannel) {
			const dms = await dmChannel.messages.fetch({ limit: 100 }, false);
			const maybeMsg = dms.find(dm => dm.author!.id === this.id);
			if (maybeMsg) {
				if (await maybeMsg.react(EMOJI_ID).then(() => true, () => false)) {
					maybeMsg.reactions.remove(EMOJI_ID);
					return false;
				} else {
					return true;
				}
			}
		}

		if (context.guild) {
			const blocksMeInGuild = this._blocksMeInGuild(context.guild, context.channel as TextChannel);
			if (blocksMeInGuild !== undefined) return blocksMeInGuild;
		}

		for (const guild of this.client.guilds.values()) {
			const blocksMeInGuild = this._blocksMeInGuild(guild);
			if (blocksMeInGuild !== undefined) return blocksMeInGuild;
		}

		return undefined;
	}

	private async _blocksMeInGuild(this: User | GuildMember,
			guild: Guild, contextChannel?: TextChannel): Promise<boolean | undefined> {
		if (!await guild.members.fetch({ user: this, cache: false })
			.then(() => true, () => false)) {
			return undefined;
		}

		let maybeMsg: Message | undefined;

		if (contextChannel) {
			const msgs = await contextChannel.messages.fetch({ limit: 100 }, false);
			maybeMsg = msgs.find(m => m.author !== null && m.author.id === this.id);
			if (maybeMsg && !maybeMsg.reactable) maybeMsg = undefined;
		}

		if (!maybeMsg) {
			const channels = guild.channels.filter(contextChannel ?
				c => c.type === 'text' && c.id !== contextChannel.id :
				c => c.type === 'text') as
				Collection<string, TextChannel>;

			for (const channel of channels.values()) {
				const msgs = await channel.messages.fetch({ limit: 100 }, false);
				maybeMsg = msgs.find(m => m.author !== null && m.author.id === this.id);
				if (maybeMsg) {
					if (maybeMsg.reactable) break;
					maybeMsg = undefined;
				}
			}
		}

		if (!maybeMsg) return undefined;

		return maybeMsg.react(EMOJI_ID).then(() => false, () => true);
	}

}
