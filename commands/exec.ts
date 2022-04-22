import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Message } from "discord.js";
import logger from "../modules/logger";

export const data = new SlashCommandBuilder()
	.setName("exec")
	.setDescription("Executes a script")
	.setDefaultPermission(false)
	.addStringOption((option) =>
		option
			.setName("script")
			.setDescription("The script to execute")
			.setRequired(true)
	);

export const perms = [
	{
		id: "153102177429094400",
		type: "USER",
		permission: true,
	},
];

export const run = (interaction: CommandInteraction, client: Client) => {
	let response;

	const process = undefined; // Hide Environment Variables From Scope
	const script = interaction.options.getString("script")!;

	try {
		response = eval(script);
		if (typeof response == "object") {
			response = JSON.stringify(response);
		}
	} catch (e) {
		logger.log(e as Error);
		interaction.reply({
			content: `\`\`\`${e}\`\`\``,
			ephemeral: true,
		});

		return;
	}

	interaction.reply({
		content: `Executed\n\`\`\`js\n${script}\n\`\`\`\nResult\n\`\`\`json\n${response?.toString()}\n\`\`\``,
		ephemeral: true,
	});
};
