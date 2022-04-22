import { Client, TextChannel } from "discord.js";
import database from "../imports/database";
import { attachListener } from "../imports/reactRole_listener";
import logger from "./logger";

export async function register_reactRole_listeners(client: Client) {
	try {
		for await (const doc of database.RoleMessage.find()) {
			let channel = client.channels.cache.get(doc.channelId) as TextChannel;
			channel.messages
				.fetch(doc.messageId)
				.then((message) => attachListener(message, doc.emojiName));
		}

		logger.log("Listeners Attached", "ReactRoles");
	} catch (e) {
		logger.log(e as Error);
	}
}
