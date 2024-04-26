const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"criar",
    description:"[🛠 Moderação/Vendas 💸] | Crie um Produto",
    type:ApplicationCommandType.ChatInput,
    options:[
        {
            name:"id",
            description:"Coloque o ID do novo produto aqui!",
            type: ApplicationCommandOptionType.String,
            required:true,
        }
    ],
    run:async (client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão de usar este comando`, ephemeral:true});
        const id = interaction.options.getString("id")
        const prod = await vendas.db.get(`produto_${id}`);
        if(prod) return interaction.reply({content:`${emoji.nao} | Já existe um Produto com este ID!`, ephemeral:true});
        await interaction.reply({content:`${emoji.loading} | Aguarde um momento estou criando seu ticket`, ephemeral:true});

        await interaction.channel.send({
            embeds:[
                new EmbedBuilder()
                .setTitle(`Titulo Não Configurado`)
                .setDescription(`\`\`\` Sem Descrição \`\`\` \n${emoji.planeta}** | Nome: ${id}** \n ${emoji.dinheiro}** | Preço: R$10.00** \n ${emoji.caixa}** | Estoque: __0__**`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${id}_produto`)
                    .setLabel("Comprar")
                    .setEmoji(emoji.carrinho)
                    .setStyle(3)
                )
            ]
        }).then((msg) => {
            const db = vendas.db;
            db.set(`produto_${id}`, {
                idproduto:id,
                cupom: true,
                titulo: "Titulo Não Configurado",
                desc:"``` Sem Descrição ```",
                nome: id,
                preco: 10,
                conta:[],
                mensagem:{
                    id: msg.id,
                    channelid: interaction.channel.id
                },
                banner: "Sem Banner",
                thumbnail: "Sem Thumbnail",
                cor: "#000000"
            });
            interaction.editReply({content:`${emoji.sim} | Produto: ${id} Criado com sucesso!`});
        })
        

    }}