const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");
const { QuickDB } = require("quick.db");
const db = new QuickDB({table:"ticket"});



module.exports = {
    name: "deleteallticket", 
    description: "Deletar todos os tickets",
    type: ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão de usar este comando`, ephemeral:true});
        await interaction.reply({content:`${emoji.loading} | Aguarde um momento estou procurando todos os Ticket's...`, ephemeral:true});

        var channels_ticket = await interaction.guild.channels.cache.filter(c => c.name.includes('🎫・'));
        let quantiachannel = 0;
        let quantiacall = 0;

        channels_ticket.forEach(async element => {
            element = await element
            quantiachannel++;
            element.delete().then(() => {
                interaction.editReply({content:`Foram Apagados: ${quantiachannel} de Ticket's e ${quantiacall} de Call's`})
            })
        });
        var channels_ticket_call = await interaction.guild.channels.cache.filter(c => c.name.includes('📞-'));
        
        channels_ticket_call.forEach(async element => {
            element = await element
            quantiacall++;
            element.delete().then(() => {
                interaction.editReply({content:`Foram Apagados: ${quantiachannel} de Ticket's e ${quantiacall} de Call's`})
            })
        });

        db.deleteAll()

        
    }
}