import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, CommandInteraction, Guild, Interaction, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js'
import { attachListener } from '../imports/reactRole_listener'
import database from '../imports/database'
import logger from '../modules/logger'

export const data = new SlashCommandBuilder()
    .setName("delreactrole")
    .setDescription("Deletes a reaction role from a message")
    .setDefaultPermission(false)

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

export const run = async (interaction: CommandInteraction, client: Client, guild: Guild) => {
    await interaction.deferReply({ ephemeral: true })
    interaction.editReply("Now click the reaction to remove")

    const timeoutPromise = new Promise<MessageReaction | PartialMessageReaction>((resolve, reject) => setTimeout(reject, 15000))
    const reactionPromise = new Promise<MessageReaction | PartialMessageReaction>(resolve => {
        const attemptResolve = (reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
            if(interaction.user.id == user.id) resolve(reaction)
        }

        client.on('messageReactionAdd', (reaction, user) => attemptResolve(reaction, user))
        client.on('messageReactionRemove', (reaction, user) => attemptResolve(reaction, user))
    })

    await Promise.race([timeoutPromise, reactionPromise])
        .then(async reaction => {
            await reaction.message.reactions.cache.find(result => result == reaction)?.users.remove(interaction.user.id)
            await reaction.users.remove(client.user?.id)
            const result = await database.RoleMessage.findOneAndDelete({ messageId: reaction.message.id, emojiName: reaction.emoji.name })
            if(result == null) {
                interaction.editReply("The reaction did not have a role")
                logger.log(Error("Reaction had no role attached"))
                return
            }
            interaction.editReply("Deleted the reaction role")
        })
        .catch(e => logger.log(e))
}