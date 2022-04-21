import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, GuildMemberManager, Message } from 'discord.js'
import logger from '../modules/logger'

export const data = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verifies a user")
    .setDefaultPermission(false)
    .addUserOption(option => 
        option.setName("user")
        .setDescription("The user to verify")
        .setRequired(true)
    )
    .addStringOption(option => 
        option.setName("in-game-name")
        .setDescription("The name of the player in Wolvesville")
        .setRequired(false)
    )

export const perms = [
    {
        id: 'Staff',
        type: 'ROLENAME',
        permission: true
    }
]    

export const run = async (interaction: CommandInteraction) => {
    if (interaction.channel?.type == 'DM') return

    await interaction.deferReply({ ephemeral: true })
    const villagerRole = interaction.guild?.roles.cache.find( r => r.name == "Probably Not Villager" )!
    const memberRole = interaction.guild?.roles.cache.find( r => r.name == "Probably Not Member" )!

    const target = interaction.options.getUser("user")!
    await interaction.guild?.members.fetch(target.id)
    const member = interaction.guild?.members.cache.get(target.id) || undefined

    if(member == undefined) {
        interaction.editReply("An error occured, please try again")
        logger.log(Error("Member was not stored in cache"))
        return
    }

    const nick = interaction.options.getString("in-game-name") || member?.displayName!

    await interaction.channel?.messages.fetch({ limit: 100 }).catch(e => logger.log(e))

    let messages
    try {
        messages = interaction.channel?.messages.cache.filter(message => message.author.id == member?.id)
        interaction.channel?.bulkDelete(messages!)
    } catch {
        return
    }

    if(!member.roles.highest.editable) {
        interaction.editReply(`Cannot verify a user with the role ${member.roles.highest}`)
        logger.log(Error(`Target has role ${member.roles.highest.name}`))
        return
    }

    await member?.setNickname(nick).catch(e => logger.log(e))

    await member?.roles.add(memberRole).then(() => setTimeout(() => member.roles.remove(villagerRole), 2000)).catch(e => logger.log(e))

    interaction.editReply("Member verified")
}