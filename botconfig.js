const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const next = require("../../DataBase/index");
const emoji = require("../../DataBase/emojis.json");
const owner = require("../../DataBase/owner.json");

module.exports = {
    name:"botconfig",
    description:"[🛠 Moderação/Vendas 💸] | Configure o Sistema de Vendas e Ticket",
    type: ApplicationCommandType.ChatInput,
    dm_permission:true,
    run: async(client, interaction) => {

        if(interaction.user.id !== next.owner.get("ownerid")) return await interaction.reply({content:`${emoji.aviso} | ${interaction.user}, Você não tem permissão dê usar este comando!`, ephemeral:true});

        await interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Sistema de Configurações Gerais`)
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setFooter({text:`${interaction.client.user.username} - Todos os Direitos Reservados`, iconURL: interaction.client.user.displayAvatarURL()})
                .setDescription(`Olá ***${interaction.user.username}***, Seja Bem Vindo ao painel de configuração, escolha abaixo qual opção você deseja configurar`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_configvendas`)
                    .setLabel("Configurar Vendas")
                    .setStyle(1)
                    .setEmoji("🤑"),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_configticket`)
                    .setLabel("Configurar Ticket")
                    .setStyle(1)
                    .setEmoji("🎫")
                )
            ]
        })


    }
}