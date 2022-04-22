import { Message, MessageReaction, PartialMessage, User } from "discord.js";
import database from "./database";

export const attachListener = async (
	message: Message | PartialMessage,
	reactionEmoji: string
) => {
	const filter = (reaction: MessageReaction) => {
		return reaction.emoji.name === reactionEmoji;
	};

	let collector = message.createReactionCollector({ filter, dispose: true });

	collector.on("collect", async (reaction, user) =>
		toggleRole(reaction, user, true)
	);
	collector.on("remove", async (reaction, user) =>
		toggleRole(reaction, user, false)
	);
};

async function toggleRole(
	reaction: MessageReaction,
	user: User,
	mode: boolean
) {
	const entry = await database.RoleMessage.findOne({
		messageId: reaction.message.id,
		reaction: reaction.emoji.name,
	});
	const role =
		reaction.message.guild?.roles.cache.get(entry.roleId) || undefined;

	if (role == undefined) return;

	reaction.message.guild?.members.fetch(user.id).then((member) => {
		setTimeout(() => {
			database.RoleMessage.findOne({ messageId: reaction.message.id }).then(
				(result) => {
					if (result == null) return;
					try {
						mode ? member.roles.add(role) : member.roles.remove(role);
					} catch (e) {
						console.log(e);
					}
				}
			);
		}, 3000);
	});
}
