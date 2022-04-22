import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, CommandInteraction } from "discord.js";
import { config } from "dotenv";
import fs from "node:fs";
import logger from "../modules/logger";
import command_listener from "./command_listener";
import permissions_constructor from "./perm_reconstructor";

config();

export default (client: Client) => {
	const commands = [];
	const commandFiles = fs
		.readdirSync("./commands")
		.filter((file) => file.endsWith(".ts"));

	const clientId = client.user?.id;
	const guild = client.guilds.cache.get("964822114693701652")!;
	logger.guild = guild;

	for (const file of commandFiles) {
		const command = require(`../commands/${file}`);

		if (command.perms) {
			guild.commands.fetch().then(async (result) => {
				await result
					.find((cmdResult) => cmdResult.name == command.data.name)
					?.permissions.set({
						permissions: permissions_constructor(guild, command.perms),
					});
			});
		}

		command_listener(
			client,
			command.data.name,
			(interaction: CommandInteraction) => {
				const args = interaction.options.data.map((option) => {
					if (option.type == "USER") return option.user?.tag;
					if (option.type == "ROLE") return option.role?.name;
					if (option.type == "CHANNEL") return option.channel?.name;
					return option.value;
				});

				logger.log(
					`executed command \`/${command.data.name}\` ${args
						.map((arg) => `\`${arg}\``)
						.join(" ")}`,
					interaction.user.tag
				);
				command.run(interaction, client, guild);
			}
		);
		commands.push(command.data.toJSON());
	}

	const rest = new REST({ version: "9" }).setToken(process.env.TOKEN!);

	(async () => {
		try {
			logger.log("Started refreshing application (/) commands.", "Commands");

			await rest.put(Routes.applicationGuildCommands(clientId!, guild.id), {
				body: commands,
			});

			logger.log("Successfully reloaded application (/) commands.", "Commands");
		} catch (error) {
			logger.log(error as Error);
		}
	})();
};
