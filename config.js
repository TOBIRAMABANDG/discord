const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"config",
    description:"[🛠 Moderação/Vendas 💸] | Configure um Produto",
    type:ApplicationCommandType.ChatInput,
    options:[
        {
            name:"id",
            description:"Coloque o ID do produto aqui!",
            type: ApplicationCommandOptionType.String,
            required:true,
            autocomplete: true,
        }
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
        const prod = await vendas.db.get(`produto_${id}`);
        if(!prod) return interaction.reply({content:`${emoji.nao} | Não existe um Produto com este ID!`, ephemeral:true});
        await interaction.reply({content:`${emoji.loading} | Aguarde um momento...`});

        interaction.editReply({
            content:``,
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
                .setDescription(`**${emoji.papel} | Descrição:**\n${prod.desc}\n\n${emoji.lupa} | Id: ${prod.idproduto}\n${emoji.planeta} | Nome: ${prod.nome}\n${emoji.dinheiro} | Preço: R$${prod.preco}\n${emoji.caixa} | Estoque quantidade: ${prod.conta.length}`)
                .setFooter({text:`${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL()})
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_tituloprod`)
                    .setLabel("TITULO")
                    .setEmoji(emoji.lupa)
                    .setStyle(3),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_mudarnomeprod`)
                    .setLabel("NOME")
                    .setEmoji(emoji.planeta)
                    .setStyle(3),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_mudarprecoprod`)
                    .setLabel("PREÇO")
                    .setEmoji(emoji.dinheiro)
                    .setStyle(3),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_mudardescprod`)
                    .setLabel("DESCRIÇÃO")
                    .setEmoji(emoji.prancheta)
                    .setStyle(3),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_mudarestoqueprod`)
                    .setLabel("ESTOQUE")
                    .setEmoji(emoji.caixa)
                    .setStyle(2),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_configadvprod`)
                    .setLabel("Configurações Avançadas")
                    .setEmoji(emoji.engrenagem)
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_attmsgprod`)
                    .setLabel("Atualizar Mensagem")
                    .setEmoji(emoji.loading)
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId(`${interaction.user.id}_${id}_deleteprod`)
                    .setLabel("DELETAR")
                    .setEmoji(emoji.lixeira)
                    .setStyle(4),
                    )
            ]
        })

    }}