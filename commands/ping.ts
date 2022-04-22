import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Returns bot latency")
	.setDefaultPermission(true);

export const run = (interaction: CommandInteraction) => {
	interaction.reply({
		content: `Latency: ${Date.now() - interaction.createdTimestamp}ms`,
		ephemeral: true,
	});
};
