const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"set",
    description:"[🛠 Moderação/Vendas 💸] | Sete Algum Produto",
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
  
        
        const channel = interaction.guild.channels.cache.get(prod.mensagem.channelid);
        await interaction.reply({content:`${emoji.loading} | Aguarde um momento...`, ephemeral:true});
        try {
            const embed = new EmbedBuilder()
            .setColor(prod.cor)
            .setTitle(`${prod.titulo}`)
            .setDescription(`${prod.desc} \n\n**${emoji.planeta} | Nome: ${prod.nome}\n${emoji.dinheiro} | Preço: R$${prod.preco}\n${emoji.caixa} | Estoque: ${prod.conta.length}**`);
            if(prod.banner.startsWith("https://")) {
                embed.setImage(prod.banner);
            } 

            if(prod.thumbnail.startsWith("https://")) {
                embed.setThumbnail(prod.thumbnail);
            } 
       
            if (channel) {
                const message = await channel.messages.fetch(prod.mensagem.id);
                if (message) {
                    setTimeout(() => {
                        message.delete().catch(() => {
                            console.log("Mensagem não encontrada");
                        });
                    }, 1000); 
                }
            }            

            await interaction.channel.send({
                embeds:[embed],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${id}_produto`)
                        .setLabel("Comprar")
                        .setEmoji(emoji.carrinho)
                        .setStyle(3)
                    )
                ]
            }).then(async(msg) => {
                await vendas.db.set(`produto_${id}.mensagem`,{
                    "id": msg.id,
                    "channelid": interaction.channel.id
                });
                await interaction.editReply({content:`${emoji.sim} | Produto ${id} Setado com sucesso!`});
            })
       
    } catch (err) {
        if(err.message === "Unknown Message") {
            const embed = new EmbedBuilder()
            .setColor(prod.cor)
            .setTitle(`${prod.titulo}`)
            .setDescription(`${prod.desc} \n\n**${emoji.planeta} | Nome: ${prod.nome}\n${emoji.dinheiro} | Preço: R$${prod.preco}\n${emoji.caixa} | Estoque: ${prod.conta.length}**`);
            if(prod.banner.startsWith("https://")) {
                embed.setImage(prod.banner);
            } 

            if(prod.thumbnail.startsWith("https://")) {
                embed.setThumbnail(prod.thumbnail);
            } 
            await interaction.channel.send({
                embeds:[embed],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${id}_produto`)
                        .setLabel("Comprar")
                        .setEmoji(emoji.carrinho)
                        .setStyle(3)
                    )
                ]
            }).then(async(msg) => {
                await vendas.db.set(`produto_${id}.mensagem`,{
                    "id": msg.id,
                    "channelid": interaction.channel.id
                });
                await interaction.editReply({content:`${emoji.sim} | Produto ${id} Setado com sucesso!`});
            })
        } else {
            interaction.followUp({content:`${emoji.aviso} | Ocorreu um erro... \n\n Mensagem do Erro: ${err.message}`, ephemeral:true});
        }
        
    } 
    }}