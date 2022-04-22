import { Client } from "discord.js";

export default (client: Client, name: string, callback: Function) => {
	client.on("interactionCreate", (interaction) => {
		if (!interaction.isCommand()) return;
		if (interaction.commandName === name.toLowerCase()) callback(interaction);
	});
};
