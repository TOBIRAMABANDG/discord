const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, StringSelectMenuBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const {configembed, configembededit, configprod} = require("../../Functions/functionConfig/painel")
const owner = require("../../DataBase/owner.json");
const axios = require("axios");
const fs = require("fs");


module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {
        const db = vendas.db;
        const customId = interaction.customId;
        if(!customId) return;

        const userid = customId.split("_")[0];
        const id = customId.split("_")[1];
        
        if(!id) return;
        if(interaction.user.id !== userid) return;
        const pn = await db.get(`painel_${id}`);
        if(!pn) return;

        if(customId.endsWith("_deletepainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_deletepainelmodal`)
            .setTitle("💢 - Deletar Painel");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel('Digite "SIM" para Deletar:')
            .setPlaceholder("SIM")
            .setRequired(true)
            .setStyle(1)
            .setMaxLength(3)
            .setMinLength(3);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_deletepainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            if(text !== "SIM") return interaction.reply({content:`${emoji.sim} | Cancelado com sucesso!`, ephemeral:true});
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento Estou Deletando Seu Painel...`, ephemeral:true});

            await db.delete(`painel_${id}`);
            await interaction.message.delete();
            await interaction.editReply({content:`${emoji.sim} | Painel Deletado com sucesso!`, ephemeral:true})
        }

        if(customId.endsWith("_atualizarpainel")) {
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
 
                const channel = await interaction.guild.channels.cache.get(pn.mensagem.channelid);
                if (channel && channel.messages.fetch(pn.mensagem.id)) {
                    
                    setTimeout(async() => {
                        await channel.messages.fetch(pn.mensagem.id)
                    .then(message => {
                        message.edit({
                            embeds:[
                                embed
                            ],
                            components:[
                                new ActionRowBuilder()
                                .addComponents(
                                    select
                                )
                            ]
                        });
                    })
                    .catch(() => {
                        console.log("Nada Demais")
                    });
                    }, 2000);
                }

                interaction.editReply({content:`${emoji.sim} | Mensagem Atualizada com sucesso!`});
            } catch (err) {
                await interaction.editReply({content:`${emoji.aviso} | Ocorreu um erro ao tentar atualizar a imagem... \n\n Mensagem do erro: ${err.message}`})
            }
        }

        if(customId.endsWith("_configembedpainel")) {
            await configembed(interaction,client);
        }
        if(customId.endsWith("_voltarpainel")) {
            await interaction.update({
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
                        .setCustomId(`${interaction.user.id}_${id}_configembedpainel`)
                        .setLabel("Configurar Embed")
                        .setStyle(3)
                        .setEmoji(emoji.planeta),
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_${id}_configprodpainel`)
                        .setLabel("Configurar Produtos")
                        .setStyle(3)
                        .setEmoji(emoji.carrinho),
                    ),
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_${id}_atualizarpainel`)
                        .setLabel("Atualizar Painel")
                        .setStyle(1)
                        .setEmoji(emoji.loading),
                        new ButtonBuilder()
                        .setCustomId(`${interaction.user.id}_${id}_deletepainel`)
                        .setLabel("DELETAR")
                        .setStyle(4)
                        .setEmoji(emoji.lixeira),
                    )
                ]
            })
        }

        if(customId.endsWith("_tituloembedpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_tituloembedpainelmodal`)
            .setTitle("💢 - Alterar Titulo da Embed");

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel("NOVO TITULO:")
            .setStyle(1)
            .setMaxLength(35)
            .setPlaceholder("Digite Aqui")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_tituloembedpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await db.set(`painel_${id}.titulo`,text);
            await configembed(interaction, client)
        } //
        
        if(customId.endsWith("_rodapeembedpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_rodapeembedpainelmodal`)
            .setTitle("💢 - Alterar Rodapé da Embed");

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel("NOVO RODAPÉ:")
            .setStyle(1)
            .setMaxLength(35)
            .setPlaceholder("Digite Aqui")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_rodapeembedpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await db.set(`painel_${id}.rodape`,text);
            await configembed(interaction, client)
        } //

        if(customId.endsWith("_placeholderembedpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_placeholderembedpainelmodal`)
            .setTitle("💢 - Alterar placeholder da Embed");

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel("NOVO PLACEHOLDER:")
            .setStyle(1)
            .setMaxLength(35)
            .setPlaceholder("Digite Aqui")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_placeholderembedpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await db.set(`painel_${id}.placeholder`,text);
            await configembed(interaction, client)
        } //

        if(customId.endsWith("_descembedpainel")) {
            interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Mudar Descrição`)
                    .setDescription(`${emoji.setadireita} Coloque a Descrição do Painel \n\n **OBS:** Coloque as Crases para ficar com fundo preto!`)
                ],
                components: [
                  new ActionRowBuilder()
                    .addComponents(
                      new ButtonBuilder()
                        .setCustomId(`${userid}_cancelled`)
                        .setLabel("Cancelar")
                        .setEmoji(emoji.nao)
                        .setStyle(4)
                    )
                ]
            })
            const filterMensagem = (msg) => msg.author.id === interaction.user.id;
            const collectorMensagem = interaction.channel.createMessageCollector({ filter: filterMensagem });
            
            
            collectorMensagem.on("collect", async (mensagem) => {
              await mensagem.delete();
              collectorMensagem.stop();
              const emojis = mensagem.content;
              await db.set(`painel_${id}.desc`, emojis)
              await configembededit(interaction, client);
              
            });
            
            
            const filterBotao = (i) => i.customId.startsWith(userid) && i.customId.endsWith("_cancelled") && i.user.id === interaction.user.id;
            const collectorBotao = interaction.channel.createMessageComponentCollector({ filter: filterBotao});
            
            
            collectorBotao.on("collect", (i) => {
              collectorMensagem.stop();
              collectorBotao.stop("cancelled");
              i.deferUpdate();
              configembededit(interaction, client);
            });

        }

        if(customId.endsWith("_corembedpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_corembedpainelmodal`)
            .setTitle("💢 - Alterar Cor da Embed");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setLabel("Digite a COR:")
            .setPlaceholder("#000000")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_corembedpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento, estou verificando a Cor..`, ephemeral:true});

            try {
                interaction.editReply({
                    embeds:[
                        new EmbedBuilder()
                        .setColor(text)
                        .setDescription(`> - Sua Nova Cor de Embed do Painel: ${text}`)
                    ]
                }).then(() => {
                    db.set(`painel_${id}.cor`, text);
                    configembededit(interaction, client);
                }).catch((err) => {
                    interaction.editReply({
                        embeds:[],
                        content:`${emoji.aviso} | Ocorreu um erro ao tentar verificar a cor \n\n Mensagem do Erro: ${err.message}`
                    })
                })
            } catch {
                await interaction.editReply({content:`${emoji.aviso} | Coloque uma Cor Valida!`});
            }
        } //
        
        if(customId.endsWith("_bannerembedpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_bannerembedpainelmodal`)
            .setTitle("💢 - Alterar Banner da Embed");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setLabel("Coloque a URL da Imagem")
            .setPlaceholder('Caso Deseja Remover Digite: "remover"')
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_bannerembedpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            if(text === "remover") {
                await db.set(`painel_${id}.banner`, text);
                configembed(interaction, client);
                return;
            }
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento, estou verificando a Imagem..`, ephemeral:true});

            try {
                interaction.editReply({
                    content:"",
                    embeds:[
                        new EmbedBuilder()
                        .setImage(text)
                        .setDescription(`> - Seu Novo banner:`)
                    ]
                }).then(() => {
                    db.set(`painel_${id}.banner`, text);
                    configembededit(interaction, client);
                }).catch((err) => {
                    interaction.editReply({
                        embeds:[],
                        content:`${emoji.aviso} | Ocorreu um erro ao tentar verificar a Imagem \n\n Mensagem do Erro: ${err.message}`
                    })
                })
            } catch {
                await interaction.editReply({content:`${emoji.aviso} | Coloque uma Imagem Valida!`});
            }
        }
        
        
        if(customId.endsWith("_miniaturaembedpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_miniaturaembedpainelmodal`)
            .setTitle("💢 - Alterar Miniatura da Embed");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setLabel("Coloque a URL da Imagem")
            .setPlaceholder('Caso Deseja Remover Digite: "remover"')
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_miniaturaembedpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            if(text === "remover") {
                await db.set(`painel_${id}.thumbnail`, text);
                configembed(interaction, client);
                return;
            }
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento, estou verificando a Imagem..`, ephemeral:true});

            try {
                interaction.editReply({
                    content:"",
                    embeds:[
                        new EmbedBuilder()
                        .setImage(text)
                        .setDescription(`> - Sua Nova Miniatura:`)
                    ]
                }).then(() => {
                    db.set(`painel_${id}.thumbnail`, text);
                    configembededit(interaction, client);
                }).catch((err) => {
                    interaction.editReply({
                        embeds:[],
                        content:`${emoji.aviso} | Ocorreu um erro ao tentar verificar a Imagem \n\n Mensagem do Erro: ${err.message}`
                    })
                })
            } catch {
                await interaction.editReply({content:`${emoji.aviso} | Coloque uma Imagem Valida!`});
            }
        }
        
        if(customId.endsWith("_addproductpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_addproductpainelmodal`)
            .setTitle("➕ - Adicionar Produto no Painel");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("COLOQUE O ID DO PRODUTO:")
            .setStyle(1)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_addproductpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const uai = await db.get(`produto_${text}`);
            if(!uai) return interaction.reply({content:`${emoji.aviso} | Não Existe Este Produto!`, ephemeral:true});
            if(pn.idprodutos.includes(text)) return interaction.reply({content:`${emoji.aviso} Este Produto já foi adicionado!`, ephemeral:true});
            await db.push(`painel_${id}.idprodutos`, text);
            await configprod(interaction, client);
        }

        if(customId.endsWith("_removerproductpainel")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_removerproductpainelmodal`)
            .setTitle("➕ - Adicionar Produto no Painel");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("COLOQUE O ID DO PRODUTO:")
            .setStyle(1)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_removerproductpainelmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            const uai = await db.get(`produto_${text}`);
            if(!uai) return interaction.reply({content:`${emoji.aviso} | Não Existe Este Produto!`, ephemeral:true});
            if(!pn.idprodutos.includes(text)) return interaction.reply({content:`${emoji.aviso} Este Produto não foi adicionado!`, ephemeral:true});
            await db.pull(`painel_${id}.idprodutos`, text);
            await configprod(interaction, client);
        }
        if(customId.endsWith("_configprodpainel")) {
            await configprod(interaction, client)
        }
    }}