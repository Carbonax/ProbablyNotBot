import { SlashCommandBuilder } from '@discordjs/builders'
import { Client, CommandInteraction, Guild, Interaction, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js'
import { attachListener } from '../imports/reactRole_listener'
import database from '../imports/database'
import logger from '../modules/logger'

export const data = new SlashCommandBuilder()
    .setName("addreactrole")
    .setDescription("Adds a reaction role to a message")
    .setDefaultPermission(false)
    .addRoleOption(option => 
        option.setName("role")
            .setDescription("The role the reaction should toggle")
            .setRequired(true)
    )

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
    const role = guild.roles.cache.get(interaction.options.getRole("role")!.id)!
    
    if(!role.editable || role.name == "@everyone") {
        interaction.editReply("Missing permissions to add role")
        logger.log(Error("Role is not editable"))
        return
    }
    
    interaction.editReply("Now add your reaction")

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
            await reaction.message.react(reaction.emoji.name!)
            await reaction.message.reactions.cache.find(result => result == reaction)?.users.remove(interaction.user.id)

            attachListener(reaction.message, reaction.emoji.name!)

            const db = new database.RoleMessage({
                channelId: reaction.message.channel.id,
                messageId: reaction.message.id,
                roleId: role.id,
                emojiName: reaction.emoji.name
            })
            
            db.save().then(() => interaction.editReply("Role added to reaction."))
        })
        .catch(e => logger.log(e))
}