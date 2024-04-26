const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"criarcupom",
    description:"[🛠 Moderação/Vendas 💸] | Crie um Cupom",
    type:ApplicationCommandType.ChatInput,
    options:[
        {
            name:"id",
            description:"Coloque o ID do novo Cupom aqui!",
            type: ApplicationCommandOptionType.String,
            required:true,
        },
        {
            name:"tipo",
            description:"Coloque o TIPO de Cupom",
            type: ApplicationCommandOptionType.String,
            required:true,
             choices: [
                { name: `Dinheiro`, value: `dinheiro` },
                { name: `Desconto`, value: `desconto` },
            ]
        },
    ],
    run:async (client, interaction) => {
        if(interaction.user.id !== next.owner.get("ownerid") && interaction.user.id !== next.perm.get(`${interaction.user.id}`)) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão de usar este comando`, ephemeral:true});
        const id = interaction.options.getString("id");
        const type = interaction.options.getString("tipo");
        const cupom = await vendas.cupom.get(`${id}`);
        if(cupom) return interaction.reply({content:`${emoji.sim} | Já Existe um cupom com este ID`, ephemeral:true});

        if(type === "dinheiro") {
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento...`, ephemeral:true});
            await vendas.cupom.set(`${id}`, {
                dinheiro: 5,
                valormin: 0,
                quantidade:0,
                type:"dinheiro"
            });
            interaction.editReply({content:`${emoji.sim} Cupom ${id} Foi Criado com sucesso! \n ${emoji.dinheiro} | Reduzirar: \`R$5\` \n${emoji.bagmoney} | Valor Minimo: 0 \n ${emoji.caixa} | Quantidade: \`0\``})
        } else {
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento...`, ephemeral:true});
            await vendas.cupom.set(`${id}`, {
                porcentagem: 10,
                valormin: 0,
                quantidade:0,
                type:"desconto"
            });
            interaction.editReply({content:`${emoji.sim} Cupom ${id} Foi Criado com sucesso! \n ${emoji.dinheiro} | Reduzirar: \`10%\` \n${emoji.bagmoney} | Valor Minimo: 0 \n ${emoji.caixa} | Quantidade: \`0\``})
        }
    }}