const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, ApplicationCommandOptionType, StringSelectMenuBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");



module.exports = {
    name:"set-painel",
    description:"[🛠 Moderação/Vendas 💸] | Sete Algum painel",
    type:ApplicationCommandType.ChatInput,
    options:[
        {
            name:"id",
            description:"Coloque o ID do Painel aqui!",
            type: ApplicationCommandOptionType.String,
            required:true,
            autocomplete: true,
        }
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
        const id = interaction.options.getString("id");
        const pn = await vendas.db.get(`painel_${id}`);
        const db = vendas.db;
        if(!pn) return interaction.reply({content:`${emoji.nao} | Não existe um Painel com este ID!`, ephemeral:true});
        await interaction.reply({content:`${emoji.loading} | Aguarde um momento...`, ephemeral:true});

        try {  
            const embed = new EmbedBuilder()
            .setColor(pn.cor)
            .setTitle(`${pn.titulo}`)
            .setDescription(`${pn.desc}`);
            if(pn.banner.startsWith("https://")) {
                embed.setImage(pn.banner);
            } 
            if(pn.thumbnail.startsWith("https://")) {
                embed.setThumbnail(pn.thumbnail);
            } 
            if(pn.rodape !== "Sem Rodapé") {
                embed.setFooter({text:`${pn.rodape}`, iconURL: interaction.guild.iconURL()});
            }

            const select = new StringSelectMenuBuilder() 
            .setCustomId(`${id}_painel`)
            .setMaxValues(1)
            .setPlaceholder(`${pn.placeholder}`);

            await pn.idprodutos.map(async(rs) => {
                const ide = await db.get(`produto_${rs}`);
                if(ide) {
                    await select.addOptions(
                        {
                            label: ide.nome,
                            emoji: emoji.carrinho,
                            description:`💸 | Valor: R$${ide.preco} - 📦 | Estoque: ${ide.conta.length}`,
                            value: rs
                        }
                    )
                }
            })

            try {
                const channel = await interaction.guild.channels.cache.get(pn.mensagem.channelid);
                if (channel) {
                    const message = await channel.messages.fetch(pn.mensagem.id);
                    if (message) {
                        setTimeout(() => {
                            message.delete().catch(() => {
                                console.log("Mensagem não encontrada");
                            });
                        }, 1000); // Ajuste o tempo aqui
                    }
                }
            } catch {
                console.log("Mensagem não encontrada");
            }
            

            setTimeout(() => {
                interaction.channel.send({
                    embeds:[embed],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(select)
                    ]
                }).then(async(msg) => {
                    await db.set(`painel_${id}.mensagem`,{
                        id: msg.id,
                        channelid: interaction.channel.id
                    })
                    interaction.editReply({content:`${emoji.sim} | Painel Enviado com sucesso!`});
                })
            }, 2300);

        } catch (err) {
            await interaction.editReply({content:`${emoji.aviso} | Ocorreu um erro ao tentar atualizar a imagem... \n\n Mensagem do erro: ${err.message}`})
        }
    }}