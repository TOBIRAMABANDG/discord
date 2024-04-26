const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const owner = require("../../DataBase/owner.json");
const {config, configedit, stock, stockedit, configadv, configadvedit} = require("../../Functions/functionConfig/product")
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
        const prod = await db.get(`produto_${id}`);
        if(!prod) return;
        
        if(customId.endsWith("_mudarnomeprod")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_nomemodalprod`)
            .setTitle(`💢 - Mudar nome do produto`);

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel("COLOQUE O NOME DO PRODUTO:")
            .setStyle(1)
            .setMaxLength(45)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_nomemodalprod")) {
            const text = interaction.fields.getTextInputValue("text");
            await db.set(`produto_${id}.nome`, text);
            await config(interaction, client);
        }
        
        if(customId.endsWith("_tituloprod")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_tituloprodmodal`)
            .setTitle(`💢 - Mudar nome do produto`);

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel("COLOQUE O TITULO DO PRODUTO:")
            .setStyle(1)
            .setMaxLength(45)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_tituloprodmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            await db.set(`produto_${id}.titulo`, text);
            await config(interaction, client);
        }
        
        if(customId.endsWith("_mudarprecoprod")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_precomodalprod`)
            .setTitle(`💢 - Mudar Preço do produto`);

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel("COLOQUE O PREÇO DO PRODUTO:")
            .setStyle(1)
            .setPlaceholder("1")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_precomodalprod")) {
            const text = parseFloat(interaction.fields.getTextInputValue("text")).toFixed(2);
            if(text < 0) return interaction.reply({content:`${emoji.aviso} | Coloque um valor acima de 0`, ephemeral:true});
            if(isNaN(text)) return interaction.reply({content:`${emoji.aviso} | Coloque Numeros!`, ephemeral:true});

            await db.set(`produto_${id}.preco`, Number(text).toFixed(2));
            await config(interaction, client);
        }
        
        if(customId.endsWith("_mudardescprod")) {
            interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Mudar Descrição`)
                    .setDescription(`${emoji.setadireita} Coloque a Descrição do produto \n\n **OBS:** Coloque as Crases para ficar com fundo preto!`)
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
              await db.set(`produto_${id}.desc`, emojis)
              await configedit(interaction, client);
              
            });
            
            
            const filterBotao = (i) => i.customId.startsWith(userid) && i.customId.endsWith("_cancelled") && i.user.id === interaction.user.id;
            const collectorBotao = interaction.channel.createMessageComponentCollector({ filter: filterBotao});
            
            
            collectorBotao.on("collect", (i) => {
              collectorMensagem.stop();
              collectorBotao.stop("cancelled");
              i.deferUpdate();
              configedit(interaction, client);
            });
        }

        if(customId.endsWith("_attmsgprod")) {
            const prod = await vendas.db.get(`produto_${id}`);
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

           if (channel && channel.messages.fetch(prod.mensagem.id)) {
            
               channel.messages.fetch(prod.mensagem.id)
                   .then(message => {
                    message.edit({ embeds: [embed],
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId(`${id}_produto`)
                                .setLabel("Comprar")
                                .setStyle(3)
                                .setEmoji(emoji.carrinho)
                            )
                        ] });
                   })
                   .catch(() => {
                    interaction.editReply({content:`${emoji.aviso} | Ocorreu um erro ao tentar atualizar a mensagem`, ephemeral:true});
                   });
           }
           
        } catch {
            interaction.editReply({content:`${emoji.aviso} | Ocorreu um erro ao tentar atualizar a mensagem`, ephemeral:true});
        } finally {
            interaction.editReply(`${emoji.sim} | Mensagem Atualizada com sucesso`)
        }
        }

        if(customId.endsWith("_deleteprod")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_delmodalproduct`)
            .setTitle("🗑 - Deletar Produto");

            const text = new TextInputBuilder()
            .setStyle(1)
            .setMaxLength(3)
            .setMinLength(3)
            .setRequired(true)
            .setCustomId("text")
            .setPlaceholder("SIM")
            .setLabel("Coloque 'SIM' para Deletar");

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_delmodalproduct")) {
            const text = interaction.fields.getTextInputValue("text");
            if(text !== "SIM") return interaction.reply({content:`${emoji.sim} | Cancelado com sucesso!`, ephemeral:true});
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento estou deletando o produto..`, ephemeral:true});
            await db.delete(`produto_${id}`);
            interaction.message.delete();
            interaction.editReply({content:`${emoji.sim} | Produto Deletado com sucesso!`, ephemeral:true}); 

            try {
                const channel = interaction.guild.channels.cache.get(prod.mensagem.channelid);
           if (channel && channel.messages.fetch(prod.mensagem.id)) {
            
               channel.messages.fetch(prod.mensagem.id)
                   .then(message => {
                    message.delete();
                   })
                   .catch(() => {
                    interaction.editReply({content:`${emoji.aviso} | Ocorreu um erro ao tentar atualizar a mensagem`, ephemeral:true});
                   });
           }
           
        } catch (err){
            console.log("Ocorreu um erro: " + err.message);
        } finally {
            console.log("Mensagem apagada")
        }
        }

        if(customId.endsWith("_voltarprod")) {
            await config(interaction, client);
        }

        if(customId.endsWith("_mudarestoqueprod")) {
            await stock(interaction, client);
        }

        if(customId.endsWith("_addstockprod")) {
            await interaction.update({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`${emoji.setadireita} Qual forma você deseja adicionar estoque?`)
                    .setColor("Random")
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${userid}_${id}_umporum`)
                        .setLabel("ADICIONAR UM POR UM")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId(`${userid}_${id}_quantidadelinha`)
                        .setLabel("QUANTIA DE LINHA (TXT)")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId(`${userid}_${id}_mudarestoqueprod`)
                        .setLabel("Voltar")
                        .setStyle(1),
                    )
                ]
            })
        }

        if(customId.endsWith("_umporum")) {
            interaction.update({embeds:[
                new EmbedBuilder()
                .setDescription(`🔍 | Envie o produto de um em um, quando terminar de enviar aperte no botão abaixo:`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_cancelled`)
                    .setLabel("Finalizar")
                    .setStyle(3)
                    .setEmoji(emoji.sim)
                )
            ]
        })
            const filterMensagem = (msg) => msg.author.id === interaction.user.id;
            const collectorMensagem = interaction.channel.createMessageCollector({ filter: filterMensagem });
          
            let count = 0;
            collectorMensagem.on("collect", async (mensagem) => {
              mensagem.delete();
              const emojis = mensagem.content;
              await db.push(`produto_${id}.conta`, emojis);
              count++;
            });
          
            
            const filterBotao = (i) => i.customId.startsWith(userid) && i.customId.endsWith("_cancelled") && i.user.id === interaction.user.id;
            const collectorBotao = interaction.channel.createMessageComponentCollector({ filter: filterBotao});
          
            
            collectorBotao.on("collect", (i) => {
              collectorMensagem.stop();
              collectorBotao.stop("cancelled");
              i.deferUpdate();
              stockedit(interaction, client);
              interaction.followUp({content:`✅ | Foram adicionados \`${count}\` Produtos`, ephemeral:true});
            });
        }

        if(customId.endsWith("_quantidadelinha")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_quantialinhamodal`)
            .setTitle("💢 - Linhas por Produto");

            const text = new TextInputBuilder()
            .setCustomId(`text`)
            .setLabel("Quantas Linhas por Produto?")
            .setStyle(1)
            .setPlaceholder("ex: 5 linhas = 1 produto")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal)
        }

        if (customId.endsWith("_quantialinhamodal")) {
            const text = parseInt(interaction.fields.getTextInputValue("text"));
            if (isNaN(text)) return interaction.reply({ content: `${emoji.aviso} | Coloque Apenas numeros!`, ephemeral: true });
            if (text <= 0) return interaction.reply({ content: `${emoji.aviso} | Coloque um valor acima de 0`, ephemeral: true });
        
            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`🔍 | Envie o Arquivo txt e ele será agrupado a ${text}`)
                        .setColor("Random")
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`${userid}_cancelled`)
                                .setLabel("Cancelar")
                                .setStyle(3)
                                .setEmoji(emoji.nao)
                        )
                ]
            });
        
            const collectedLines = [];
            const filterMensagem = (msg) => msg.author.id === interaction.user.id;
            const collectorMensagem = interaction.channel.createMessageCollector({ filter: filterMensagem, time: 60000 });
            
            collectorMensagem.on("collect", async (mensagem) => {
                mensagem.delete();
                if (mensagem.attachments.size > 0) {
                    const attachment = mensagem.attachments.first();
                    if (attachment.name.endsWith('.txt')) {
                        try {
                            const response = await axios.get(attachment.url);
                            const lines = response.data.toString('utf-8').split('\n');
            
                            const groupedLines = [];
                            let currentGroup = [];
            
                            for (const line of lines) {
                                currentGroup.push(line);
            
                                if (currentGroup.length === text) {
                                    groupedLines.push(currentGroup.slice());
                                    currentGroup = [];
                                }
                            }
                            

                            if (currentGroup.length > 0) {
                                groupedLines.push(currentGroup);
                            }
            
                            
                            collectedLines.push(...groupedLines);
                        } catch (error) {
                            console.error(error);
                            return interaction.followUp({ content: `${emoji.aviso} | Houve um problema ao obter o conteúdo do anexo.`, ephemeral: true });
                        }
                    } else {
                        
                        return interaction.followUp({ content: `${emoji.aviso} | Por favor, envie um arquivo de texto (.txt).`, ephemeral: true });
                    }
                } else {
                    
                    const lines = mensagem.content.split('\n');
            
                    const groupedLines = [];
                    let currentGroup = [];
            
                    for (const line of lines) {
                        currentGroup.push(line);
            
                        if (currentGroup.length === text) {
                            groupedLines.push(currentGroup.slice());
                            currentGroup = [];
                        }
                    }
            
                    
                    if (currentGroup.length > 0) {
                        groupedLines.push(currentGroup);
                    }
            
                    
                    collectedLines.push(...groupedLines);
                }
            
                collectorBotao.stop("cancelled");
                
                for (const group of collectedLines) {
                    const cleanedGroup = group.map(line => line.replace(/\r/g, '')).filter(line => line.trim() !== '');
                    if (cleanedGroup.length > 0) {
                        const content = cleanedGroup.join('\n');
                        await db.push(`produto_${id}.conta`, content);
                    }
                }
                collectorMensagem.stop();
                
                stockedit(interaction, client);
                interaction.followUp({ content: `✅ | Foram adicionados \`${collectedLines.length}\` Produtos`, ephemeral: true });
                
                
                
            });
            

            const filterBotao = (i) => i.customId.startsWith(userid) && i.customId.endsWith("_cancelled") && i.user.id === interaction.user.id;
            const collectorBotao = interaction.channel.createMessageComponentCollector({ filter: filterBotao });
        
            collectorBotao.on("collect", (i) => {
                collectorMensagem.stop();
                collectorBotao.stop("cancelled");
                i.deferUpdate();
                stockedit(interaction, client);
                interaction.followUp({ content: `✅ | A coleta de produtos foi cancelada.`, ephemeral: true });
            });
        }
        
        if (customId.endsWith("_removestockprod")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_removestockmodal`)
            .setTitle("🔧 | Remover");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Coloque o número da linha do produto:")
            .setStyle(1)
            .setPlaceholder("Ex: 1")
            .setMaxLength(4000);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_removestockmodal")) {
            const text = parseInt(interaction.fields.getTextInputValue("text"));
            if(isNaN(text)) return interaction.reply({content:`${emoji.aviso} | Error: Valor inválido!`, ephemeral:true});
            if(text < 0) return interaction.reply({content:`${emoji.aviso} | Error: Valor inválido!`, ephemeral:true});
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento...`, ephemeral:true});

            const stock = await db.get(`produto_${id}.conta`);
            if(Number(text) > stock.length) return interaction.reply({content:`${emoji.aviso} | Error: Item não encontrado!`, ephemeral:true});
            try{
                const a = await db.get(`produto_${id}.conta`);
                const removedItem = a.splice(Number(text), 1)[0]; 
                await db.set(`produto_${id}.conta`, a);
                await stockedit(interaction, client);
                interaction.editReply({content:`${emoji.sim} | Removido com sucesso! \n\n Produto Removido: ${removedItem}`});
                } catch (err){
                    interaction.editReply({
                        content:`${emoji.aviso} | Aconteceu um erro: \n${err.message}`,
                        ephemeral:true
                    }); 
                }
        }

        if(customId.endsWith("_backupstockprod")) {
            await interaction.reply({
                content:`${emoji.loading} | Aguarde um Momento estou fazendo Backup..`,
                ephemeral:true
            });
            try {
                setTimeout(() => {
                var contas = `${db.get(`produto_${id}.conta`)}`.split(',');
        
            const backupItems = contas.map((item, index) => `${index} | - ${item}`);
            var backup = `Aqui o seu estoque:\n\n${backupItems.join('\n')}`; 
        
            fs.writeFile('estoque.txt', backup, (err) => {
                if (err) throw err;
        
                interaction.editReply({
                    content:`${emoji.loading} | Aqui está o Backup do ProdutoID: ${id}`,
                    files: [{
                        attachment: 'estoque.txt',
                        name: 'estoque.txt'
                    }]
                }).then(() => {
                  
                    fs.unlink('estoque.txt', (err) => {
                        if (err) throw err;
                    });
                }).catch(err => {
                    console.error('Erro ao enviar o arquivo:', err);
                });
            });
                
            }, );
        } catch {
            interaction.editReply({content:`${emoji.aviso} | Ocorreu um erro ao tentar fazer backup do produtoID: ${id}`});
        }
        }

        if(customId.endsWith("_limparstockprod")) {
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_limparstockmodal`)
            .setTitle("💢 - Limpar Estoque do Produto");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setRequired(true)
            .setLabel("coloque \"SIM\" para Limpar")
            .setPlaceholder("SIM")
            .setMaxLength(3)
            .setMinLength(3);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_limparstockmodal")) {
            const text = interaction.fields.getTextInputValue("text");
            if(text !== "SIM") return interaction.reply({content:`${emoji.sim} | Cancelado com sucesso`, ephemeral:true});
            await interaction.reply({content:`${emoji.loading} | Limpando seu estoque aguarde um momento...`, ephemeral:true});
            await db.set(`produto_${id}.conta`, []);
            stockedit(interaction, client);
            interaction.editReply({content:`${emoji.sim} | Limpado com sucesso!`, ephemeral:true});

        }

        if(customId.endsWith("_configadvprod")){
            await configadv(interaction,client);
        }

        if(customId.endsWith("_bannerprod")){
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_bannerprodmodal`)
            .setTitle("💢 - Alterar Banner do Produto");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Coloque a URL da imagem")
            .setPlaceholder('Caso queira retirar digite: "remover"')
            .setStyle(1)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_bannerprodmodal")){
            const text = interaction.fields.getTextInputValue("text");
            if(text === "remover") {
                await db.set(`produto_${id}.banner`, text);
                await configadv(interaction, client);
                return;
            }
            await interaction.reply({content:`${emoji.loading} | Verificando a imagem..`, ephemeral:true});

            try {
                interaction.editReply({
                    content:`${interaction.user}`,
                    embeds:[
                        new EmbedBuilder()
                        .setDescription(`***${interaction.user.username}*** Seu Novo Banner: `)
                        .setImage(text)
                    ]
                }).then(() => {
                    db.set(`produto_${id}.banner`, text)
                    configadvedit(interaction, client);
                }).catch(() => {
                    interaction.editReply({content:`${emoji.aviso} | Verifique se você colocou uma imagem valida!`, ephemeral:true})
                })
            } catch {
                interaction.editReply({content:`${emoji.aviso} | Verifique se você colocou uma imagem valida!`, ephemeral:true})
            }
        }

        if(customId.endsWith("_miniaturaprod")){
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_miniaturaprodmodal`)
            .setTitle("💢 - Alterar Miniatura do Produto");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Coloque a URL da imagem")
            .setPlaceholder('Caso queira retirar digite: "remover"')
            .setStyle(1)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_miniaturaprodmodal")){
            const text = interaction.fields.getTextInputValue("text");
            if(text === "remover") {
                await db.set(`produto_${id}.thumbnail`, text);
                await configadv(interaction, client);
                return;
            }
            await interaction.reply({content:`${emoji.loading} | Verificando a imagem..`, ephemeral:true});

            try {
                interaction.editReply({
                    content:`${interaction.user}`,
                    embeds:[
                        new EmbedBuilder()
                        .setDescription(`***${interaction.user.username}*** Sua nova Miniatura: `)
                        .setImage(text)
                    ]
                }).then(() => {
                    db.set(`produto_${id}.thumbnail`, text)
                    configadvedit(interaction, client);
                }).catch(() => {
                    interaction.editReply({content:`${emoji.aviso} | Verifique se você colocou uma imagem valida!`, ephemeral:true})
                })
            } catch {
                interaction.editReply({content:`${emoji.aviso} | Verifique se você colocou uma imagem valida!`, ephemeral:true})
            }
        }

        if(customId.endsWith("_corprod")){
            const modal = new ModalBuilder()
            .setCustomId(`${userid}_${id}_corprodmodal`)
            .setTitle("💢 - Alterar Cor do Produto");

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("Coloque a cor da embed")
            .setPlaceholder('#000000')
            .setStyle(1)
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_corprodmodal")){
            const text = interaction.fields.getTextInputValue("text");
            await interaction.reply({content:`${emoji.loading} | Verificando a cor..`, ephemeral:true});

            try {
                interaction.editReply({
                    content:`${interaction.user}`,
                    embeds:[
                        new EmbedBuilder()
                        .setDescription(`***${interaction.user.username}*** Sua nova cor: ${text}`)
                        .setColor(text)
                    ]
                }).then(() => {
                    db.set(`produto_${id}.cor`, text)
                    configadvedit(interaction, client);
                }).catch(() => {
                    interaction.editReply({content:`${emoji.aviso} | Verifique se você colocou uma cor valida!`, ephemeral:true})
                })
            } catch {
                interaction.editReply({content:`${emoji.aviso} | Verifique se você colocou uma cor valida!`, ephemeral:true})
            }
        }

        if(customId.endsWith("_cupomprod")){
            if(prod.cupom === true) {
                await db.set(`produto_${id}.cupom`, false);
            } else {
                await db.set(`produto_${id}.cupom`, true);
            }

            await configadv(interaction, client);
        }
    }}