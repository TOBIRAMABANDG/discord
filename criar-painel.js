const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType, StringSelectMenuBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"criar-painel",
    description:"[🛠 Moderação/Vendas 💸] | Crie um painel DropDown",
    type:ApplicationCommandType.ChatInput,
    options:[
        {
            name:"painel",
            description:"Coloque o ID do novo Painel aqui!",
            type: ApplicationCommandOptionType.String,
            required:true,
        },
        {
            name:"id",
            description:"Coloque o ID do produto aqui!",
            type: ApplicationCommandOptionType.String,
            required:true,
            autocomplete: true,
        },
    ],
    async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLowerCase();
        const db = await vendas.db;
        let choices = await (await db.all()).filter(d => d.ID.startsWith("produto"));
    
        const filtered = choices.filter(choice => {
            
            return choice.data.idproduto.toLowerCase().includes(value);
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
                filtered.map(choice => ({ name: `ID - ${choice.data.idproduto} | Nome - ${choice.data.nome}`, value: choice.data.idproduto }))
            );
        }
    },
    run:async (client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão de usar este comando`, ephemeral:true});
        const id = interaction.options.getString("id");
        const idpainel = interaction.options.getString("painel");
        const pn = await vendas.db.get(`painel_${idpainel}`);
        if(pn) return interaction.reply({content:`${emoji.aviso} | Já Existe um Painel com este ID!`, ephemeral:true});
        const prod = await vendas.db.get(`produto_${id}`);
        if(!prod) return interaction.reply({content:`${emoji.nao} | Não existe Produto com este ID!`, ephemeral:true});
        await interaction.reply({content:`${emoji.loading} | Aguarde um momento estou criando seu Painel`, ephemeral:true});

        await interaction.channel.send({
            embeds:[
                new EmbedBuilder()
                .setTitle(`Titulo Não Configurado`)
                .setDescription(`Descrição Não Configurado`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(`${id}_painel`)
                    .setMaxValues(1)
                    .setPlaceholder("Selecione um Produto")
                    .addOptions(
                        {
                            label: prod.nome,
                            emoji: emoji.carrinho,
                            description:`💸 | Valor: R$${prod.preco} - 📦 | Estoque: ${prod.conta.length}`,
                            value: id
                        }
                    )
                )
            ]
        }).then((msg) => {
            const db = vendas.db;
            db.set(`painel_${id}`, {
                idpainel:id,
                titulo: "Titulo Não Configurado",
                desc:"Descrição Não Configurado",
                idprodutos:[`${id}`],
                mensagem:{
                    id: msg.id,
                    channelid: interaction.channel.id
                },
                banner: "Sem Banner",
                thumbnail: "Sem Thumbnail",
                cor: "#000000",
                rodape: "Sem Rodapé",
                placeholder: "Selecione um Produto"
            });
            interaction.editReply({content:`${emoji.sim} | Painel: ${id} Criado com sucesso!`});
        })
        

    }}