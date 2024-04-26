const { ApplicationCommandType, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");



module.exports = {
    name:"giveaway-setup",
    description:`[🛠 Moderação] Crie um Sorteio`,
    type:ApplicationCommandType.ChatInput,
    run: async(client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão de usar este comando`, ephemeral:true});

        const modal = new ModalBuilder()
        .setCustomId("giveaway_setup_modal")
        .setTitle("🎉 - Crie um Sorteio");

        const title = new TextInputBuilder()
        .setCustomId("title")
        .setLabel("COLOQUE O TITULO:")
        .setStyle(1)
        .setMaxLength(50)
        .setRequired(true)
        .setPlaceholder("OBRIGATORIO");

        const desc = new TextInputBuilder()
        .setCustomId("desc")
        .setLabel("COLOQUE A DESCRIÇÃO")
        .setStyle(2)
        .setRequired(true)
        .setPlaceholder("OBRIGATORIO");

        const banner = new TextInputBuilder()
        .setCustomId("banner")
        .setStyle(1)
        .setRequired(false)
        .setPlaceholder("(OPCIONAL)")
        .setLabel("COLOQUE A URL DA IMAMGE:");

        const tempo = new TextInputBuilder()
        .setCustomId("tempo")
        .setLabel("TEMPO")
        .setStyle(1)
        .setPlaceholder("1D, 2H, 4M, 6S")
        .setRequired(false);

        const usuarios = new TextInputBuilder()
        .setCustomId("quantia")
        .setLabel("QUANTIDADE DE VENCEDORES")
        .setStyle(1)
        .setPlaceholder("(PADRÃO: 1) (NÃO OBRIGATORIO)")
        .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(title));
        modal.addComponents(new ActionRowBuilder().addComponents(desc));
        modal.addComponents(new ActionRowBuilder().addComponents(banner));
        modal.addComponents(new ActionRowBuilder().addComponents(tempo));
        modal.addComponents(new ActionRowBuilder().addComponents(usuarios));
        
        return interaction.showModal(modal);
    }
}