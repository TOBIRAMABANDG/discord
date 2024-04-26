const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"gerenciarvendas",
    description:"[🛠 Moderação/Vendas 💸] Gerenciar Vendas",
    type:ApplicationCommandType.ChatInput,
    run:async (client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão de usar este comando`, ephemeral:true});
        await interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Gerenciar Vendas`)
                .setDescription(`**${emoji.engrenagem} | Gerencie suas vendas usando este comando.**`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_aprovarcompra`)
                    .setLabel("Aprovar Compra")
                    .setStyle(3)
                    .setEmoji(emoji.sim),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_statuscompra`)
                    .setLabel("Status Compra")
                    .setStyle(1)
                    .setEmoji(emoji.prancheta),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_reembolsarcompra`)
                    .setLabel("Reembolsar Compra")
                    .setStyle(2)
                    .setEmoji(emoji.nao),
                )
            ]
        })

    }}