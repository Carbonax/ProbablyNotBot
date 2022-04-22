import { Client, GuildMember } from "discord.js";
import logger from "./logger";

// Regex Match
const prefix = /\bProbably\s{0,}Not\s{0,}/gi;

export default (client: Client) => {
	client.on("guildMemberUpdate", (oldMember, newMember) => {
		if (newMember.nickname != oldMember.nickname) rewriteNick(newMember);
	});
	client.on("guildMemberAdd", (member) => rewriteNick(member, true));
};

function rewriteNick(member: GuildMember, isNewMember = false) {
	const formattedName = member.displayName.replace(prefix, "");

	const oldNick = member.displayName;
	const newNick = `Probably Not ${formattedName}`.substring(0, 32);

	if (member.nickname == newNick) return;
	const reason = isNewMember ? "Joined Server" : "Nickname Rewrite";
	member
		.setNickname(newNick, reason)
		.then(() =>
			logger.log(
				`renamed from \`${oldNick}\` to \`${newNick}\` with reason \`${reason}\``,
				member.user.tag
			)
		)
		.catch((e) => logger.log(e));
}
