const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"ticket",
    description:"[🛠 - Moderação] Execute o Comando de Ticket",
    type:ApplicationCommandType.ChatInput,
    run:async (client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão de usar este comando`, ephemeral:true});
        await interaction.reply({content:`${emoji.loading} | Aguarde um momento...`, ephemeral:true});

        try {
            const all = await ticket.embed.get("fora");
        const embed = new EmbedBuilder().setDescription(`${all.description}`).setColor(all.cor);
        let title = all.title;

        title = title.replace(/#{guild}/g, interaction.guild.name);
        embed.setTitle(title);
        if(all.footer !== "remover") {
            embed.setFooter({text:`${all.footer}`});
        }
        if(all.banner.startsWith("https://")) {
            embed.setImage(all.banner);
        }

        const row = new ButtonBuilder().setCustomId("ticket").setLabel(`${all.button.label}`).setStyle(all.button.cor).setEmoji(all.button.emoji);
        await interaction.channel.send({
            embeds:[embed],
            components:[new ActionRowBuilder().addComponents(row)]
        }).then(() => {
            interaction.editReply({content:`${emoji.sim} | Painel de Ticket Enviado com sucesso!`})
        }).catch((err) => {
            interaction.editReply({content:`${emoji.aviso} | Ocorreu um erro ao tentar enviar o painel... \n\n Mensagem do erro: ${err.message}`})
        })
        } catch(err) {
            interaction.editReply({content:`${emoji.aviso} | Ocorreu um erro ao tentar enviar o painel... \n\n Mensagem do erro: ${err.message}`})
        }

    }
}