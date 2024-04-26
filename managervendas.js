const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");




module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {
        const {customId} = interaction;
        if(!customId) return;
        const userid = customId.split("_")[0];
        if(interaction.user.id !== userid) return;

        if(customId.endsWith("_aprovarcompra")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_aprovarmodal`)
            .setTitle("✅ - Aprovar Carrinho");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setPlaceholder("Ex: 1197917101952876614")
            .setLabel("COLOQUE O ID DO CANAL:")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_aprovarmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const channel = await vendas.vlogs.get(`${text}`);
            if(!channel) return interaction.reply({content:`${emoji.aviso} | Não Existe este Carrinho!`, ephemeral:true});
            if(channel.status !== "process") return interaction.reply({content:`${emoji.aviso} | Só é possivel aprovar carrinhos pendentes!`, ephemeral:true});
            await vendas.vlogs.set(`${text}.status`, "sucess");
            await interaction.reply({content:`${emoji.sim} | Carrinho Aprovado com sucesso!`, ephemeral:true});
        }

        if(customId.endsWith("_statuscompra")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_statuscompramodal`)
            .setTitle("✅ - Aprovar Carrinho");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setPlaceholder("Ex: 1197917101952876614")
            .setLabel("COLOQUE O ID DO CANAL:")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_statuscompramodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const channel = await vendas.vlogs.get(`${text}`);
            if(!channel) return interaction.reply({content:`${emoji.aviso} | Não Existe este Carrinho!`, ephemeral:true});
            let stat = channel.status;
            stat = stat.replace("sucess", "Aprovado Por /gerenciarvendas");
            stat = stat.replace("process", "Ainda em processo!");
            stat = stat.replace("refund", "Reembolsado");
            stat = stat.replace("pagamento", "Aprovado por Pagamento");


            await interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Status Carrinho`)
                    .setDescription(`${emoji.usuario} | Dono do Carrinho: <@${channel.owner}> - ${channel.owner} \n ${emoji.aviso} | Status do Carrinho: ${stat} \n ${emoji.dinheiro} | Preço Total: ${channel.precototal}`)
                ],
                ephemeral:true
            })
        }

        if(customId.endsWith("_reembolsarcompra")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_reembolsarcompramdaol`)
            .setTitle("❌ - Reembolsar Carrinho");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setPlaceholder("Ex: 1197917101952876614")
            .setLabel("COLOQUE O ID DO CANAL:")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_reembolsarcompramdaol")) {
            const text = interaction.fields.getTextInputValue("text");
            const channel = await vendas.vlogs.get(`${text}`);
            if(!channel) return interaction.reply({content:`${emoji.aviso} | Não Existe este Carrinho!`, ephemeral:true});
            if(channel.status !== "pagamento") return interaction.reply({content:`${emoji.aviso} | Só é possivel reembolsar carrinhos que foram pagos!`, ephemeral:true});
            try {
                await axios.post(`https://api.mercadopago.com/v1/payments/${data.body.id}/refunds`, {}, {
                  headers: {
                    Authorization: `Bearer ${await vendas.vconfig.get("mp")}`
                  }
                });

                await vendas.vlogs.set(`${text}.status`, "refund");
                await interaction.reply({content:`${emoji.sim} | Carrinho Reembolsado com sucesso!`, ephemeral:true});
                

              } catch (error) {
                await interaction.reply({content:`Ocorreu um erro ao tentar reembolsar... \n\n Mensagem do Erro: ${error.message}`, ephemeral:true});
              }
        }

    }}