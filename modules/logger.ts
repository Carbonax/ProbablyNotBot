import { Guild, TextChannel } from "discord.js";

class _Logger {
	public guild: Guild | undefined;

	async log(message: string | Error, title = " ") {
		console.log(
			message instanceof Error
				? message
				: `${title == " " ? "" : title} ${message.replace(/\`|\_|\~|\*/gm, "")}`
		);
		const channel = this.guild?.channels.cache.find(
			(channel) => channel.name.endsWith("bot-logs") && channel.isText()
		)! as TextChannel;
		await channel.send(
			message instanceof Error
				? `> \`${message}\``
				: `> ${title == " " ? "" : `**${title}**`} ${message}`
		);
		return;
	}
}

export default new _Logger();
