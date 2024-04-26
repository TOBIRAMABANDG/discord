const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const next = require("../../DataBase/index");
const emoji = require("../../DataBase/emojis.json");
const owner = require("../../DataBase/owner.json");

module.exports = {
    name:"perm",
    description:"[🛠 Moderação/Vendas 💸] Configure as permissões",
    type: ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid")) return await interaction.reply({content:`${emoji.aviso} | ${interaction.user}, Você não tem permissão dê usar este comando!`, ephemeral:true});
        const all = await next.perm.all();
        let msg = "";
        if(all.length <= 0) {
            msg = "**Adicione Permissão para Alguem que ela Irá aparecer aqui!**";
        } else {
            all.map((rs, index) => {
                msg += `${index + 1}° | <@${rs.ID}> - \`${rs.ID}\` \n`
            });
        }

        interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Configurar Permissões`)
                .setDescription(`Olá ***${interaction.user.username}*** Aqui está a lista de quem tem permissão: \n\n ${msg}`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("addpermbot")
                    .setLabel("Adicionar Permissão")
                    .setStyle(3)
                    .setEmoji(emoji.adicionar),
                    new ButtonBuilder()
                    .setCustomId("clearpermbot")
                    .setLabel("Limpar Permissão")
                    .setStyle(2)
                    .setEmoji(emoji.lixeira),
                    new ButtonBuilder()
                    .setCustomId("removerpermbot")
                    .setLabel("Remover Permissão")
                    .setStyle(4)
                    .setEmoji(emoji.remover),
                )
            ],
            ephemeral:true
        })


    }
}