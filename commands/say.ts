import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import logger from '../modules/logger'

export const data = new SlashCommandBuilder()
    .setName("say")
    .setDescription("Makes the bot say something")
    .addStringOption(option => 
        option.setName("message")
            .setDescription("The message the bot should say")
            .setRequired(true))
    .addStringOption(option => 
        option.setName("reply-to")
            .setDescription("A message ID to reply to")
            .setRequired(false))

export const perms = [
    {
        id: 'Probably Not Leader',
        type: 'ROLENAME',
        permission: true
    },
    {
        id: 'Probably Not Co-Leader',
        type: 'ROLENAME',
        permission: true
    }
]    

export const run = async (interaction: CommandInteraction) => {
    const [replyTo, message] = [interaction.options.getString("reply-to"), interaction.options.getString("message")]

    await interaction.deferReply({ ephemeral: true })

    if (replyTo == undefined) {
        interaction.channel?.send(message!).then(() => {
            interaction.editReply("Message Sent")
        })
    } else {
        interaction.channel?.messages.fetch(replyTo)
            .then(async (messageInstance) => {
                await messageInstance.reply(message!)
                interaction.editReply("Message Sent")
            })
            .catch((e) => {
                if(e.code !== 10008) throw e
                logger.log(e)
                interaction.editReply("Invalid Reply-To")
            })
    }
}