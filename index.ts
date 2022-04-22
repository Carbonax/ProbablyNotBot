import DiscordJS, { Intents } from "discord.js";
import { config } from "dotenv";
import register_commands from "./imports/register_commands";
import database from "./imports/database";
import { register_reactRole_listeners } from "./modules/reactRoles_persist";
import nickRewrite from "./modules/nickRewrite";
import logger from "./modules/logger";
// Get .env Configuration
config();

// Initialise Client
export const client = new DiscordJS.Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
	partials: ["REACTION", "MESSAGE"],
	presence: {
		status: "online",
		activities: [
			{
				name: "Wolvesville",
				type: "PLAYING",
				url: "https://wolvesville.com/",
			},
		],
	},
});

console.log("Initialising");
client.on("ready", async () => {
	register_commands(client);
	await database.connect();
	await register_reactRole_listeners(client);
	nickRewrite(client);
	logger.log("Initialisation Complete", "Client");
});

client.login(process.env.TOKEN);
