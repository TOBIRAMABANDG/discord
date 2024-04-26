const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"config-cupom",
    description:"[🛠 Moderação/Vendas 💸] | Configure um Cupom",
    type:ApplicationCommandType.ChatInput,
    options:[
        {
            name:"id",
            description:"Coloque o ID do Cupom aqui!",
            type: ApplicationCommandOptionType.String,
            required:true,
            autocomplete: true,
        },
    ],
    async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLowerCase();
        const db = await vendas.cupom;
        let choices = await db.all();
    
        const filtered = choices.filter(choice => {
            return choice.ID.toLowerCase().includes(value);
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
                filtered.map(choice => ({ name: `✔ | CUPOM - ${choice.ID} 💸 | Desconto - ${choice.data.type === "dinheiro" ? `R$${choice.data.dinheiro}` : `${choice.data.porcentagem}%`} 📦 | Quantidade - ${choice.data.quantidade}`, value: choice.ID }))
            );
        }
    },
    run:async (client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão de usar este comando`, ephemeral:true});
        const id = interaction.options.getString("id");
        const cupom = await vendas.cupom.get(`${id}`);
        if(!cupom) return interaction.reply({content:`${emoji.aviso} | Não Existe nenhum cupom com este ID!`, ephemeral:true});
        const userid = interaction.user.id
        await interaction.reply({
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.guild.name} | Gerenciar Cupom`)
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setFooter({text:`${interaction.guild.name} - Todos os Direitos Reservados`,iconURL: interaction.guild.iconURL()})
                .setDescription(`Cupom sendo gerenciado: \n\n **${emoji.lupa} | Nome:** \`${id}\` \n **${emoji.dinheiro} | ${cupom.type === "dinheiro" ? `Desconto do Preço: \`R$${cupom.dinheiro}\``: `Porcentagem de Desconto: \`${cupom.porcentagem}\``}** \n ${emoji.carrinho}** | Valor Mínimo:** \`R$${cupom.valormin}\` \n ${emoji.bagmoney}** | Quantidade:** ${cupom.quantidade}`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_configdesconto`)
                    .setLabel("Configurar Desconto/Porcentagem")
                    .setStyle(3)
                    .setEmoji(emoji.dinheiro),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_valormincupom`)
                    .setLabel("Valor Mínimo")
                    .setStyle(3)
                    .setEmoji(emoji.carrinho),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_quantidadecupom`)
                    .setLabel("Adicionar Quantidade")
                    .setStyle(3)
                    .setEmoji(emoji.adicionar),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_removerquantidadecupom`)
                    .setLabel("Remover Quantidade")
                    .setStyle(4)
                    .setEmoji(emoji.remover),
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${userid}_${id}_deletecupom`)
                        .setLabel("Deletar Cupom")
                        .setStyle(2)
                        .setEmoji(emoji.lixeira),
                        )
            ]
        })

    }}