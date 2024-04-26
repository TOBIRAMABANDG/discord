const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType, StringSelectMenuBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"config-painel",
    description:"[🛠 Moderação/Vendas 💸] | Configure um painel DropDown",
    type:ApplicationCommandType.ChatInput,
    options:[
        {
            name:"painel",
            description:"Coloque o ID do Painel",
            type: ApplicationCommandOptionType.String,
            required:true,
            autocomplete: true,
        },
    ],
    async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLowerCase();
        const db = await vendas.db;
        let choices = await (await db.all()).filter(d => d.ID.startsWith("painel"));
    
        const filtered = choices.filter(choice => {
            
            return choice.data.idpainel.toLowerCase().includes(value);
        }).slice(0, 25);
    
        if (!interaction) return;
    
        if (await interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) {
            await interaction.respond([
                { name: "Você não tem permissão para usar esse comando!", value: "vcnaotempermlolkkkkk" }
            ]);
        } else if (choices.length === 0) {
            await interaction.respond([
                { name: "Você não tem nenhum produto criado!", value: "a22139183954312asd92384XASDASDSADASDSADASDASD12398212222" }
            ]);
        } else if (filtered.length === 0) {
            await interaction.respond([
                { name: "Não Encontrei esse produto", value: "a29sad183912a213sd92384XASDASDSADASDSADASDASD1239821" }
            ]);
        } else {
            await interaction.respond(
                filtered.map(choice => ({ name: `🗄 | Painel - ${choice.data.idpainel}`, value: choice.data.idpainel }))
            );
        }
    },
    run:async (client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão de usar este comando`, ephemeral:true});
        const idpainel = interaction.options.getString("painel");
        await interaction.reply({content:`${emoji.loading} | Aguarde um momento estou criando seu Painel`, ephemeral:false});
        const pn = await vendas.db.get(`painel_${idpainel}`);
        if(!pn) return interaction.editReply({content:`${emoji.aviso} | Não Existe um Painel com este ID!`,}).then((msg) => { setTimeout(() => {msg.delete();}, 2500);})
        
        await interaction.editReply({
            content:"",
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Gerenciar Painel`)
                .setDescription(`${emoji.setadireita} Escolha oque deseja gerenciar:`)
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setFooter({text:`${interaction.guild.name} - Todos os direitos reservados.`, iconURL:interaction.guild.iconURL()})
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${idpainel}_configembedpainel`)
                    .setLabel("Configurar Embed")
                    .setStyle(3)
                    .setEmoji(emoji.planeta),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${idpainel}_configprodpainel`)
                    .setLabel("Configurar Produtos")
                    .setStyle(3)
                    .setEmoji(emoji.carrinho),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${idpainel}_atualizarpainel`)
                    .setLabel("Atualizar Painel")
                    .setStyle(1)
                    .setEmoji(emoji.loading),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${idpainel}_deletepainel`)
                    .setLabel("DELETAR")
                    .setStyle(4)
                    .setEmoji(emoji.lixeira),
                )
            ]
        })

    }}