const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder, StringSelectMenuBuilder, AttachmentBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const owner = require("../../DataBase/owner.json");
const axios = require("axios");
let timer;
const mercadopago = require("mercadopago");
const config = require("../../config.json");
const moment = require("moment");
const fs = require("fs");

module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {
        const db = vendas.db;
        const { customId, guild, user, isModalSubmit} = interaction;
        if(!customId) return;

        if(interaction.isButton() && customId.endsWith("_produto") || customId.endsWith("_painel") && interaction.isStringSelectMenu()) {
            let id = `produto_${customId.split("_")[0]}`;
            if(interaction.isStringSelectMenu()) {
                id = `produto_${interaction.values[0]}`;
            }
            await edit(id)
            if(await vendas.vconfig.get("vendasonoff") === false) return interaction.reply({content:`${emoji.aviso} | O Sistema de Vendas está desabilitado...`, ephemeral:true});
            if(await vendas.vconfig.get("mp") === "Não Configurado") return interaction.reply({content:`${emoji.aviso} | O Dono do BOT não configurou a forma de pagamento, aguarde um momento para comprar!`, ephemeral:true});

            const channelfind = guild.channels.cache.find(c => c.topic === `cart - ${user.id}`);
            if(channelfind) return interaction.reply({
                content:`${emoji.aviso} | Você já tem um Carrinho Aberto!`,
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setURL(channelfind.url)
                        .setStyle(5)
                        .setLabel("Ir ao Carrinho")
                        .setEmoji(emoji.carrinho)
                    )
                ],
                ephemeral:true,
            });
            await interaction.reply({content:`${emoji.loading} | Aguarde um Momento Verificando Produto`, ephemeral:true});
            const prod = await db.get(`${id}`);

            if(!prod) return interaction.editReply(`${emoji.aviso} | Não Encontrei o Banco de Dados desse Produto!`);

            if(prod.conta.length <= 0) {
            await interaction.editReply({content:`${emoji.aviso} | Este Produto está sem Estoque!`, ephemeral:true});
            return;
            } 
            await interaction.editReply({content:`${emoji.loading} | Produto Verificado, Criando Carrinho...`, ephemeral:true});
            
            await interaction.guild.channels.create({
                name:`🛒・${user.username}`,
                topic:`cart - ${user.id}`,
                permissionOverwrites:[
                    {
                        id: interaction.guild.id,
                        deny:["ViewChannel", "SendMessages"]
                    },
                    {
                        id: interaction.user.id,
                        deny:[ "SendMessages"],
                        allow:["ViewChannel"]
                    },
                ],
                parent:`${await vendas.vconfig.get("category") === "Não Configurado" ? interaction.channel.parent.id : await vendas.vconfig.get("category")}`
            }).then(async(channel) => {
                await interaction.editReply({content:`${emoji.loading} | Carrinho Criado, Carregando Mensagens...`});
                await channel.send({
                    content:`${user}`,
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema de Compra`)
                        .setDescription(`${emoji.trombeta} | Olá ${user}, este é seu carrinho, fique á vontade para fazer as modificações que achar necessário. \n\n ${emoji.alerta} | Lembre-se de ler nossos termos de compra, para não ter nenhum problema futuramente, ao continuar com a compra, você concorda com nossos termos. \n\n ${emoji.sino} | Quando estiver tudo pronto aperte o botão abaixo, para continuar com sua compra!`)
                        .setFooter({text:`${interaction.guild.name} - Todos os direitos reservados.`, iconURL: guild.iconURL()})
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_aceitarcontinuar`)
                            .setStyle(3)
                            .setLabel("Aceitar e Continuar")
                            .setEmoji(emoji.sim),
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_cancelarcompra`)
                            .setStyle(4)
                            .setLabel("Cancelar")
                            .setEmoji(emoji.nao),
                            new ButtonBuilder()
                            .setLabel("Ler os Termos")
                            .setCustomId(`termoscarrinho`)
                            .setStyle(3)
                            .setEmoji(emoji.prancheta),
                        )
                    ]
                }).then(async() => {
                    resettime(channel);
                    await channel.send({
                        embeds:[
                            new EmbedBuilder()
                            .setDescription(`${emoji.prancheta}** | Produto:** \`${prod.nome}\` \n\n ${emoji.bagmoney}** | Quantidade:** \`1\` \n\n ${emoji.dinheiro}** | Preço:** \`R$${Number(prod.preco).toFixed(2)}\` \n\n ${emoji.carrinho}** | Quantidade disponivel:** \`${prod.conta.length}\``)
                        ],
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId(`${user.id}_adicionarcarrinho`)
                                .setLabel("+")
                                .setStyle(2),
                                new ButtonBuilder()
                                .setCustomId(`${user.id}_modificarcarrinho`)
                                .setEmoji("✏")
                                .setStyle(3),
                                new ButtonBuilder()
                                .setCustomId(`${user.id}_removercarrinho`)
                                .setLabel("-")
                                .setStyle(2),
                            )
                        ]
                    });
                    const logs = interaction.guild.channels.cache.get(await vendas.vconfig.get("logs"));
                    if(logs) {
                        logs.send({
                            embeds:[
                                new EmbedBuilder()
                                .setColor("Green")
                                .setTitle(`${interaction.guild.name} | Carrinho Criado`)
                                .setThumbnail(interaction.member.avatarURL())
                                .setTimestamp()
                                .addFields(
                                    {
                                        name:`${emoji.usuario} | Usuário:`,
                                        value:`\`${interaction.user.username} - ${interaction.user.id}\``
                                    },
                                    {
                                        name:`${emoji.papel} | Criou um Carrinho:`,
                                        value:`\`Nome Produto: ${prod.nome} - ID do Produto: ${prod.idproduto}\``
                                    },
                                    {
                                        name:`${emoji.horario} | Data / Horário:`,
                                        value:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`
                                    },
                                )
                                .setFooter({text:`${interaction.user.username} - ${interaction.user.id}`,iconURL:interaction.member.avatarURL(),})
                            ]
                        })
                    }
                    
                    await vendas.vlogs.set(`${channel.id}`, {
                        owner: user.id,
                        produto: id.split("roduto_")[1],
                        quantidade: 1,
                        precototal:Number(prod.preco).toFixed(2),
                        status:"process"
                    });
                    await interaction.editReply({
                        content:"",
                        embeds:[
                            new EmbedBuilder()
                            .setColor("Green")
                            .setDescription(`${emoji.sim} | ${user} Seu Carrinho foi aberto com sucesso no canal: ${channel.url}`)
                        ],
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setStyle(5)
                                .setURL(channel.url)
                                .setLabel("Ir para o Carrinho")
                            )
                        ]
                    });
                })
            })
        }
        
        if(customId.endsWith("_aceitarcontinuar")) {
            const c = interaction.channel.id
            const carrinho = await vendas.vlogs.get(`${c}`);
            if(interaction.user.id !== carrinho.owner) return interaction.deferUpdate();
            await interaction.channel.bulkDelete(5).then(async() => {
                const id = carrinho.produto;
                const prod = await db.get(`produto_${id}`);
                await interaction.channel.send({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Resumo da Compra`)
                        .setDescription(`${emoji.prancheta} | Produto: \`${prod.nome}\` \n${emoji.dinheiro} | Valor unitário: \`${prod.preco}\` \n ${emoji.bagmoney} | Quantidade:\`${carrinho.quantidade}\` \n ${emoji.carrinho} | Total: \`${Number(carrinho.quantidade * prod.preco).toFixed(2)}\` \n\n\n ${emoji.dinheiro}** | Valor a Pagar:** \`${Number(carrinho.quantidade * prod.preco).toFixed(2)}\` \n ${emoji.presente}** | Cupom adicionado:** \`Sem Cupom\``)
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_irpagamento`)
                            .setStyle(3)
                            .setLabel("Ir para o Pagamento")
                            .setEmoji(emoji.sim),
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_addcupomdesconto`)
                            .setStyle(1)
                            .setDisabled(prod.cupom === true ? false : true)
                            .setLabel("Adicionar Cupom de Desconto")
                            .setEmoji(emoji.cupom),
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_cancelarcompra`)
                            .setStyle(4)
                            .setLabel("Cancelar")
                            .setEmoji(emoji.nao),
                        )
                    ]

                })
            });
        }

        if(customId.endsWith("_irpagamento")) {
            const c = interaction.channel.id
            const carrinho = await vendas.vlogs.get(`${c}`);
            if(interaction.user.id !== carrinho.owner) return interaction.deferUpdate();
            if (timer) {
                clearTimeout(timer);
            }
            await interaction.update({content:`${emoji.loading} | Gerando Pagamento...`, components:[], embeds:[]});
            const id = carrinho.produto;
            const prod = await db.get(`produto_${id}`);
            await interaction.channel.bulkDelete(5).then(async() => {
                const acesstoken = await vendas.vconfig.get("mp");

                const cooldown = vendas.vconfig.get("tempopagar");
          mercadopago.configurations.setAccessToken(acesstoken);
          let avatar = `${interaction.user.avatarURL({ dynamic: false })}`;

          var date = new Date();
          const min = moment().add(Number(cooldown), 'minutes');
          const time = Math.floor(min.valueOf() / 1000);
          const moment1 = require('moment-timezone');
          const min1 = moment1().tz("America/Argentina/Buenos_Aires").add(Number(cooldown), 'minutes').toISOString();
          
          var payment_data = {
              transaction_amount: Number(carrinho.precototal),
              description: `Saldo - ${interaction.user.username}`,
              payment_method_id: 'pix',
              payer: {
                email: config.email,
                first_name: 'Paula',
                last_name: 'Guimaraes',
                identification: {
                  type: 'CPF',
                  number: '07944777984'
                },
                address: {
                  zip_code: '06233200',
                  street_name: 'Av. das Nações Unidas',
                  street_number: '3003',
                  neighborhood: 'Bonfim',
                  city: 'Osasco',
                  federal_unit: 'SP'
                }
              },
              notification_url: `${avatar}`,
              date_of_expiration: min1
          };
          mercadopago.payment.create(payment_data).then(function (data) {
            interaction.channel.bulkDelete(3).then(() => {
                
            const buffer = Buffer.from(data.body.point_of_interaction.transaction_data.qr_code_base64, "base64");
            const attachment = new AttachmentBuilder(buffer, "payment.png");
            let row = new ActionRowBuilder()
            if(vendas.vconfig.get("pix")) {
                row.addComponents(
                    new ButtonBuilder()
                    .setLabel("Pix copia e cola")
                    .setEmoji(emoji.pix)
                    .setCustomId("cpc")
                    .setStyle(1),
                    )
            }

            if(vendas.vconfig.get("qrcode")) {
                row.addComponents(
                    new ButtonBuilder()
                    .setLabel("Qr code")
                    .setEmoji(emoji.qrcode)
                    .setCustomId("qrc")
                    .setStyle(1),
                    )
            }

            if(vendas.vconfig.get("siteonoff")) {
                row.addComponents(
                    new ButtonBuilder()
                    .setLabel("Pagar No Site")
                    .setEmoji(emoji.mercadopago)
                    .setURL(data.body.point_of_interaction.transaction_data.ticket_url)
                    .setStyle(5),
                    )
            }

            row.addComponents(
                new ButtonBuilder()
                .setLabel("Verificar Pagamento")
                .setEmoji(emoji.sim)
                .setCustomId("verifypayments")
                .setStyle(3),
              new ButtonBuilder()
                .setEmoji(emoji.nao)
                .setCustomId(`${user.id}_cancelarcompra`)
                .setStyle(4),
                )
          const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild.name}| Sistema de saldo`)
            .setDescription(`
\`\`\`
Pague com pix para Pegar seu produto
\`\`\`
💸 **| Valor:**
\`R$ ${Number(carrinho.precototal).toFixed(2)}\`
🕒 **| Pagamento expira em:**
<t:${time}:f> (<t:${time}:R>)
      `)
            .setTimestamp()
            .setFooter({text:"Após efetuar o pagamento, Clique no botão de Verificar Pagamento",iconURL: interaction.user.avatarURL({ dynamic: true })});

          interaction.channel.send({embeds: [embed], components: [row] }).then(msg => {

            const collectorFilter = (interaction) => interaction.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter: collectorFilter });

            collector.on("collect", interaction => {
              if (interaction.customId === 'cpc') {
                interaction.reply({ content: `${data.body.point_of_interaction.transaction_data.qr_code}`, ephemeral: true });
              }
              if (interaction.customId === "qrc") {
                interaction.reply({ files: [attachment], ephemeral: true });
              }
              if(interaction.customId === "verifypayments") {
                axios.get(`https://api.mercadolibre.com/collections/notifications/${data.body.id}`, {
                headers: {
                  'Authorization': `Bearer ${acesstoken}`
                }
              }).then(async (doc) => {

                const int = setInterval(async() => {
                   
                if(doc.data.collection.status === "cancelled") {
                    clearInterval(int)
                    
                const carrinho = await vendas.vlogs.get(`${chn.id}`);
                if(carrinho) {
                    const user = interaction.guild.members.cache.get(carrinho.owner);
                    if(user) {
                        await user.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Compra Cancelada`)
                                .setDescription(`Olá ${user}, \n\n• A sua compra foi cancelada por **inatividade**, e todos os produtos foram devolvidos para o estoque. Você pode voltar a comrpar quando quiser!`)
                            ]
                        }).catch((err) => {console.log(`Usuario com privado bloqueado`)});
                    }
                    await vendas.vlogs.delete(`${chn.id}`);
                }
                const logs = interaction.guild.channels.cache.get(await vendas.vconfig.get("logs"));
                if(logs) {
                    logs.send({
                        embeds:[
                            new EmbedBuilder()
                            .setColor("Red")
                            .setTitle(`${interaction.guild.name} | Compra Cancelada`)
                            .setThumbnail(interaction.member.avatarURL())
                            .setTimestamp()
                            .addFields(
                                {
                                    name:`${emoji.usuario} | Usuário:`,
                                    value:`\`${interaction.user.username} - ${interaction.user.id}\``
                                },
                                {
                                    name:`${emoji.papel} | Motivo`,
                                    value:`\`Cancelada por inatividade.\``
                                },
                                {
                                    name:`${emoji.horario} | Data / Horário:`,
                                    value:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`
                                },
                            )
                            .setFooter({text:`${interaction.user.username} - ${interaction.user.id}`,iconURL:interaction.member.avatarURL(),})
                        ]
                    })
                }
                interaction.channel.delete();
                } 
                }, 3000);
                if (doc.data.collection.status === "approved") { 
                    await vendas.vlogs.set(`${interaction.channel.id}.status`, "pagamento")
                    await vendas.vlogs.set(`${interaction.channel.id}.pagamentoid`, `${data.body.id}`)
                } 

                const carrinho = await vendas.vlogs.get(`${interaction.channel.id}`);
                const prod = await db.get(`produto_${id}`)
                if(carrinho.status === "sucess" || carrinho.status === "pagamento") {
                    clearInterval(int);
                    if(prod.conta.length < carrinho.quantidade) {
                        await interaction.channel.send({
                            content:`${interaction.user}`,
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Reembolso`)
                                .setDescription(`${emoji.aviso} | Você Recebeu Reembolso porque alguem comprou primeiro!`)
                            ]
                        }).then(() => {
                            setTimeout(() => {
                                interaction.channel.delete()
                            }, 5000);
                        })

                          try {
                            await axios.post(`https://api.mercadopago.com/v1/payments/${data.body.id}/refunds`, {}, {
                              headers: {
                                Authorization: `Bearer ${acesstoken}`
                              }
                            })
                            

                          } catch (error) {
                          }
                        
                    } else {
                        const prod = await db.get(`produto_${id}`);
                        const stock = prod.conta
                        const removed = stock.splice(0, Number(carrinho.quantidade));
                        db.set(`produto_${id}.conta`, stock);
                        const role = await interaction.guild.roles.cache.get(await vendas.vconfig.get("role"));
                        if(role) {
                            try {
                                if (!interaction.member.roles.cache.has(role.id)) {
                                    interaction.member.roles.add(role.id).then(() => {console.log("Cargo Adicionado")}).catch(() => {console.log("Cargo Removido")});
                                }
                            } catch {
                                console.log("Não tenho permissão de dar cargo")
                            }
                        }
                        await interaction.channel.bulkDelete(5).then(async() => {
                            let msg = "Sem Avaliação";
                            let coração = 0
                            
            
                            interaction.channel.send({
                                content:`${emoji.sim} | Pagamento Aprovado \n ${emoji.setadireita} | Id da Compra: ${interaction.channel.id}`,
                                embeds:[
                                    new EmbedBuilder()
                                    .setTitle(`🎉 ${interaction.guild.name} | Pagamento Aprovado 🎉`)
                                    .setDescription(`${interaction.user} **Pagamento aprovado verifique sua DM**`)
                                ],
                            });
            
                            const logs = interaction.guild.channels.cache.get(await vendas.vconfig.get("logs"));
                            if(logs) {
                                if(carrinho.quantidade < 5 ) {
                                    
                                logs.send({
                                    embeds:[
                                        new EmbedBuilder()
                                        .setTitle(`${interaction.guild.name} | Compra Aprovada`)
                                        .addFields(
                                            {
                                                name:"💫 | ID PEDIDO:",
                                                value:`${interaction.channel.id}`
                                            },
                                            {
                                                name:"👥 | COMPRADOR:",
                                                value:`${interaction.user} | ${interaction.user.username}`
                                            },
                                            {
                                                name:"🆔| ID COMPRADOR:",
                                                value:`\`${interaction.user.id}\``
                                            },
                                            {
                                                name:"📅 | DATA:",
                                                value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)`
                                            },
                                            {
                                                name:`${emoji.prancheta} | PRODUTO ID:`,
                                                value:`${prod.idproduto}`
                                            },
                                            {
                                                name:"🛒 | PRODUTO(S) NOME(S):",
                                                value:`${prod.nome} x${carrinho.quantidade}`
                                            },
                                            {
                                                name:"💸 | VALOR PAGO:",
                                                value:`\`${carrinho.precototal}\``
                                            },
                                            {
                                                name:"🤝 | MÉTODO DE PAGAMENTO:",
                                                value:`\`PIX\``
                                            },
                                            {
                                                name:"✨ | PRODUTO ENTREGUE:",
                                                value:`\`\`\` ${removed.join("\n")} \`\`\``
                                            },
                                        )
                                    ]
                                })
                                } else {
                                    let msg1 = "";
                                removed.map((rs, index) => {
                                  msg1 += `📦 | Entrega do Produto: ${prod.nome} - ${index + 1}/${carrinho.quantidade} \n ${rs} \n\n`
                                });
                                  fs.writeFileSync('detalhes_compra.txt', msg1);
                                logs.send({
                                    embeds:[
                                        new EmbedBuilder()
                                        .setTitle(`${interaction.guild.name} | Compra Aprovada`)
                                        .addFields(
                                            {
                                                name:"💫 | ID PEDIDO:",
                                                value:`${interaction.channel.id}`
                                            },
                                            {
                                                name:"👥 | COMPRADOR:",
                                                value:`${interaction.user} | ${interaction.user.username}`
                                            },
                                            {
                                                name:"🆔| ID COMPRADOR:",
                                                value:`\`${interaction.user.id}\``
                                            },
                                            {
                                                name:"📅 | DATA:",
                                                value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)`
                                            },
                                            {
                                                name:`${emoji.prancheta} | PRODUTO ID:`,
                                                value:`${prod.idproduto}`
                                            },
                                            {
                                                name:"🛒 | PRODUTO(S) NOME(S):",
                                                value:`${prod.nome} x${carrinho.quantidade}`
                                            },
                                            {
                                                name:"💸 | VALOR PAGO:",
                                                value:`\`${carrinho.precototal}\``
                                            },
                                            {
                                                name:"🤝 | MÉTODO DE PAGAMENTO:",
                                                value:`\`PIX\``
                                            },
                                            {
                                                name:"✨ | PRODUTO ENTREGUE:",
                                                value:`\`No .txt Abaixo!\``
                                            },
                                        )
                                    ],
                                    files: ['detalhes_compra.txt'],
                                })
                                }
                            }
                            const mensagem = await interaction.user.send({
                                embeds: [
                                  new EmbedBuilder()
                                    .setTitle(`🎉 ${interaction.guild.name} | Compra aprovada 🎉`)
                                    .setDescription(`**🛒 | Produto(s) Comprado(s):**\n ${prod.nome} x${carrinho.quantidade} \n\n **⚡ | Id da Compra:** \n ${interaction.channel.id} \n\n ❤️ | Muito obrigado por comprar conosco, ${interaction.guild.name} agradece a sua preferência!`)
                                ],
                                components: [
                                  new ActionRowBuilder()
                                    .addComponents(
                                      new ButtonBuilder()
                                        .setCustomId("avaliar_1")
                                        .setLabel("1")
                                        .setStyle(1)
                                        .setEmoji("⭐"),
                                      new ButtonBuilder()
                                        .setCustomId("avaliar_2")
                                        .setLabel("2")
                                        .setStyle(1)
                                        .setEmoji("⭐"),
                                      new ButtonBuilder()
                                        .setCustomId("avaliar_3")
                                        .setLabel("3")
                                        .setStyle(1)
                                        .setEmoji("⭐"),
                                      new ButtonBuilder()
                                        .setCustomId("avaliar_4")
                                        .setLabel("4")
                                        .setStyle(1)
                                        .setEmoji("⭐"),
                                      new ButtonBuilder()
                                        .setCustomId("avaliar_5")
                                        .setLabel("5")
                                        .setStyle(1)
                                        .setEmoji("⭐"),
                                    )
                                ]
                              }).then((mensagem) => {
                                let msg1 = "";
                                removed.map((rs, index) => {
                                  msg1 += `📦 | Entrega do Produto: ${prod.nome} - ${index + 1}/${carrinho.quantidade} \n ${rs} \n\n`
                                });
                              
                                
                                if (carrinho.quantidade > 5) {
                                  fs.writeFileSync('detalhes_compra.txt', msg1);
                                  interaction.user.send({
                                    files: ['detalhes_compra.txt'],
                                  });
                                } else {
                                    
                                  interaction.user.send({ content: `${msg1}` });
                                }
                              
                                const collectorFilter = (interaction) => interaction.user.id === interaction.user.id;
                                const collector = mensagem.createMessageComponentCollector({ filter: collectorFilter });
                              
                                collector.on("collect", async (interaction) => {
                                  if (interaction.isButton() && interaction.customId.startsWith("avaliar")) {
                                    const quanti = interaction.customId.split("_")[1];
                                    const modal = new ModalBuilder()
                                      .setCustomId(`enviaravalia_${quanti}`)
                                      .setTitle("❤ - Enviar Avaliação");
                              
                                    const text = new TextInputBuilder()
                                      .setCustomId("text")
                                      .setStyle(1)
                                      .setPlaceholder("(OPCIONAL)")
                                      .setLabel("Descreva sua avaliação")
                                      .setRequired(false);
                              
                                    modal.addComponents(new ActionRowBuilder().addComponents(text));
                              
                                    await interaction.showModal(modal);
                                  }
                              
                                  client.once("interactionCreate", async (interaction) => {
                                    if (interaction.isModalSubmit() && interaction.customId.startsWith("enviaravalia")) {
                                      const quanti = interaction.customId.split("_")[1];
                                      const text = interaction.fields.getTextInputValue("text") || "Sem mensagem...";
                                      msg = `${text}`;
                                      coração = Number(quanti)
                                      console.log(coração)
                                      await interaction.update({ components: [] });
                                      interaction.followUp({ content: `${emoji.sim} | Avaliação Enviada com Sucesso!`, ephemeral: true });
                                    }
                                  });
                              
                                })
                              }).catch(() => {
                                interaction.channel.send({
                                  embeds: [
                                    new EmbedBuilder()
                                      .setTitle(`🎉 ${interaction.guild.name} | Compra aprovada 🎉`)
                                      .setDescription(`**🛒 | Produto(s) Comprado(s):**\n ${prod.nome} x${carrinho.quantidade} \n\n **⚡ | Id da Compra:** \n ${interaction.channel.id} \n\n ❤️ | Muito obrigado por comprar conosco, ${interaction.guild.name} agradece a sua preferência!`)
                                  ],
                                })
                                let msg = "";
                                removed.map((rs, index) => {
                                  msg += `📦 | Entrega do Produto: ${prod.nome} - ${index + 1}/${carrinho.quantidade} \n ${rs} \n\n`
                                });
                                if (carrinho.quantidade > 5) {
                                    fs.writeFileSync('detalhes_compra.txt', msg);
                                    interaction.channel.send({
                                      files: ['detalhes_compra.txt'],
                                    });
                                  } else {
                                      
                                    interaction.channel.send({ content: `${msg}` });
                                  }
                                
                              })
                              
                            setTimeout(async () => {
    
                                const channelpublic = interaction.guild.channels.cache.get(await vendas.vconfig.get("public"));
                                await interaction.channel.delete();
                                if(channelpublic) {
    
                                        if(coração === 0) {
                                            
                                    channelpublic.send({
                                        content:`${interaction.user}`,
                                        embeds:[
                                            new EmbedBuilder()
                                            .setColor(prod.cor)
                                            .setTitle(`${interaction.guild.name} | Compra Aprovada`)
                                            .addFields(
                                                {
                                                    name:"👥 | COMPRADOR:",
                                                    value:`${interaction.user.username} - ${interaction.user.id}`
                                                },
                                                {
                                                    name:"🛒 | PRODUTO COMPRADO:",
                                                    value:`${prod.nome} x${carrinho.quantidade}`
                                                },
                                                {
                                                    name:"💸 | VALOR PAGO:",
                                                    value:`\`R$${carrinho.precototal}\``
                                                },
                                                {
                                                    name:"📅 | DATA:",
                                                    value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)`
                                                },
                                                {
                                                    name:"✨ | Avaliação:",
                                                    value:`\`${msg}\``
                                                },
                                            )
                                        ]
                                    });
                                        } else {
                                            const coracoes = '⭐'.repeat(coração);
                                            console.log(coração);
                                    channelpublic.send({
                                        content:`${interaction.user}`,
                                        embeds:[
                                            new EmbedBuilder()
                                            .setColor(prod.cor)
                                            .setTitle(`${interaction.guild.name} | Compra Aprovada`)
                                            .addFields(
                                                {
                                                    name:"👥 | COMPRADOR:",
                                                    value:`${interaction.user.username} - ${interaction.user.id}`
                                                },
                                                {
                                                    name:"🛒 | PRODUTO COMPRADO:",
                                                    value:`${prod.nome} x${carrinho.quantidade}`
                                                },
                                                {
                                                    name:"💸 | VALOR PAGO:",
                                                    value:`\`R$${carrinho.precototal}\``
                                                },
                                                {
                                                    name:"📅 | DATA:",
                                                    value:`<t:${Math.floor(new Date() / 1000)}:f> (<t:${~~(new Date() / 1000)}:R>)`
                                                },
                                                {
                                                    name:"✨ | Avaliação:",
                                                    value:`${coracoes} (${coração}) \n **${interaction.user.username}:** \`${msg}\``
                                                },
                                            )
                                        ]
                                    });
                                        }
                                }
                            }, 15 * 1000);

                            
                        })

                    }
                } else {
                    interaction.reply({content:`${emoji.aviso} | Pagamento Não Encontrado, Verifique se o mesmo foi enviado!`, ephemeral:true})
                }
              }).catch(err => {
                console.error(err);
              });
              }
            });
          });
            })
        })
          

            })
            

        }

        if(customId.endsWith("_addcupomdesconto")) {
            const c = interaction.channel.id
            const carrinho = await vendas.vlogs.get(`${c}`);
            if(interaction.user.id !== carrinho.owner) return interaction.deferUpdate();

            const modal = new ModalBuilder()
            .setTitle(`🏷 - Adicionar Cupom`)
            .setCustomId(`${user.id}_addcupomcartmodal`);

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setStyle(1)
            .setPlaceholder("Ex: CUPOM123")
            .setLabel("COLOQUE O CUPOM:");

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);
        }

        if(customId.endsWith("_addcupomcartmodal")) {
            const c = interaction.channel.id
            const carrinho = await vendas.vlogs.get(`${c}`);
            if(interaction.user.id !== carrinho.owner) return interaction.deferUpdate();
            const text = interaction.fields.getTextInputValue("text");
            const cupom = await vendas.cupom.get(`${text}`);
            if(!cupom) return interaction.reply({content:`${emoji.aviso} | Não Existe esse o Cupom inserido!`, ephemeral:true});
            if(cupom.quantidade <= 0) return interaction.reply({content:`${emoji.aviso} | Este Cupom não está disponivel no momento!`, ephemeral:true});


            const id = carrinho.produto;
            const prod = await db.get(`produto_${id}`);
            await interaction.deferUpdate();
            const total = Math.floor(carrinho.quantidade * Number(prod.preco).toFixed(2));
            if(cupom.valormin > total) return interaction.followUp({content:`${emoji.aviso} | O Valor Minimo do cupom é dê ${cupom.valormin}`, ephemeral:true});

            if(cupom.type === "dinheiro") {
                const totalcupom = Number(total).toFixed(2) - Number(cupom.dinheiro).toFixed(2);
                await vendas.cupom.substr(`${text}.quantidade`, 1);
                await vendas.vlogs.set(`${c}.precototal`, totalcupom);

                await interaction.message.edit({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Resumo da Compra`)
                        .setDescription(`${emoji.prancheta} | Produto: \`${prod.nome}\` \n${emoji.dinheiro} | Valor unitário: \`${prod.preco}\` \n ${emoji.bagmoney} | Quantidade:\`${carrinho.quantidade}\` \n ${emoji.carrinho} | Total: \`${Number(total).toFixed(2)}\` \n\n\n ${emoji.dinheiro}** | Valor a Pagar:** \`${totalcupom}\` \n ${emoji.presente}** | Cupom adicionado:** \`${text}\``)
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_irpagamento`)
                            .setStyle(3)
                            .setLabel("Ir para o Pagamento")
                            .setEmoji(emoji.sim),
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_addcupomdesconto`)
                            .setStyle(1)
                            .setDisabled(true)
                            .setLabel("Adicionar Cupom de Desconto")
                            .setEmoji(emoji.cupom),
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_cancelarcompra`)
                            .setStyle(4)
                            .setLabel("Cancelar")
                            .setEmoji(emoji.nao),
                        )
                    ]

                })

            } else {
                const precinho = Number(total);
                const descontoComoFracao = Number(cupom.porcentagem / 100);
                const valorDesconto = Number(precinho * descontoComoFracao);
                const totalcupom = precinho - valorDesconto;
                await vendas.cupom.substr(`${text}.quantidade`, 1);
                await vendas.vlogs.set(`${c}.precototal`, totalcupom);

                await interaction.message.edit({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Resumo da Compra`)
                        .setDescription(`${emoji.prancheta} | Produto: \`${prod.nome}\` \n${emoji.dinheiro} | Valor unitário: \`${prod.preco}\` \n ${emoji.bagmoney} | Quantidade:\`${carrinho.quantidade}\` \n ${emoji.carrinho} | Total: \`${Number(total).toFixed(2)}\` \n\n\n ${emoji.dinheiro}** | Valor a Pagar:** \`${totalcupom}\` \n ${emoji.presente}** | Cupom adicionado:** \`${text}\``)
                    ],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_irpagamento`)
                            .setStyle(3)
                            .setLabel("Ir para o Pagamento")
                            .setEmoji(emoji.sim),
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_addcupomdesconto`)
                            .setStyle(1)
                            .setDisabled(true)
                            .setLabel("Adicionar Cupom de Desconto")
                            .setEmoji(emoji.cupom),
                            new ButtonBuilder()
                            .setCustomId(`${user.id}_cancelarcompra`)
                            .setStyle(4)
                            .setLabel("Cancelar")
                            .setEmoji(emoji.nao),
                        )
                    ]

                })

            }

        }

        if(customId.endsWith("_cancelarcompra")) {
            const c = interaction.channel.id
            const carrinho = await vendas.vlogs.get(`${c}`);
            if(interaction.user.id !== carrinho.owner) return interaction.deferUpdate();
            if (timer) {
                clearTimeout(timer);
            }
            const logs = interaction.guild.channels.cache.get(await vendas.vconfig.get("logs"));
            if(logs) {
                logs.send({
                    embeds:[
                        new EmbedBuilder()
                        .setColor("Red")
                        .setTitle(`${interaction.guild.name} | Compra Cancelada`)
                        .setThumbnail(interaction.member.avatarURL())
                        .setTimestamp()
                        .addFields(
                            {
                                name:`${emoji.usuario} | Usuário:`,
                                value:`\`${interaction.user.username} - ${interaction.user.id}\``
                            },
                            {
                                name:`${emoji.papel} | Motivo`,
                                value:`\`Cancelada pelo usuário.\``
                            },
                            {
                                name:`${emoji.horario} | Data / Horário:`,
                                value:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`
                            },
                        )
                        .setFooter({text:`${interaction.user.username} - ${interaction.user.id}`,iconURL:interaction.member.avatarURL(),})
                    ]
                })
            }
            await interaction.channel.delete();
            await vendas.vlogs.delete(`${c}`);

            
        }
        if(customId.endsWith("_adicionarcarrinho")) {
            const carrinho = await vendas.vlogs.get(`${interaction.channel.id}`);
            if(interaction.user.id !== carrinho.owner) return interaction.deferUpdate();
            const quantidade = parseInt(carrinho.quantidade);
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento..`, ephemeral:true});
            const id = carrinho.produto;
            const prod = await db.get(`produto_${id}`);

            if(!prod) return interaction.editReply(`${emoji.aviso} | Não Encontrei o Banco de Dados desse Produto!`);

            if(quantidade + 1 > prod.conta.length) {
                interaction.editReply({content:`${emoji.aviso} | Você não pode Adicionar Acima do Estoque!`})
                produ(id)
                return;
            }
            const cal = quantidade + 1;
            const tot = cal * prod.preco
            await vendas.vlogs.add(`${interaction.channel.id}.quantidade`, 1);
            await vendas.vlogs.set(`${interaction.channel.id}.precototal`, tot)
            interaction.deleteReply();
            await produ(id)
        }

        if(customId.endsWith("_modificarcarrinho")) {
            const carrinho = await vendas.vlogs.get(`${interaction.channel.id}`);
            if(interaction.user.id !== carrinho.owner) return interaction.deferUpdate();
            const modal = new ModalBuilder()
            .setCustomId(`${user.id}_modifycartmodal`)
            .setTitle(`💢 - Alterar Quantidade`);

            const text = new TextInputBuilder()
            .setCustomId("text")
            .setLabel("COLOQUE A QUANTIDADE QUE VOCÊ DESEJA:")
            .setStyle(1)
            .setPlaceholder("1")
            .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(text));

            return interaction.showModal(modal);

        }

        if(customId.endsWith("_modifycartmodal")) {
            const text = parseInt(interaction.fields.getTextInputValue("text"));
            if(isNaN(text)) return interaction.reply({content:`${emoji.aviso} | Coloque um Valor numerico!`, ephemeral:true});
            if(text < 1) return interaction.reply({content:`${emoji.aviso} | Coloque um Valor acima de 0`, ephemeral:true});
            await interaction.deferUpdate();

            const carrinho = await vendas.vlogs.get(`${interaction.channel.id}`); 
            if(interaction.user.id !== carrinho.owner) return interaction.deferUpdate(); 

            const quantidade = parseInt(carrinho.quantidade);
            const id = carrinho.produto;

            const prod = await db.get(`produto_${id}`);
            if(!prod) return interaction.followUp(`${emoji.aviso} | Não Encontrei o Banco de Dados desse Produto!`);
            if(text > prod.conta.length) {
                produ(id)
                interaction.followUp({
                    content:`${emoji.aviso} | Não Coloque um valor acima do estoque!`,
                    ephemeral:true
                });
                return;
            }
            const cal = text;
            const tot = cal * prod.preco
            await vendas.vlogs.set(`${interaction.channel.id}.precototal`, tot)
            await vendas.vlogs.set(`${interaction.channel.id}.quantidade`, Number(text));
            await produ(id)
        }

        if(customId.endsWith("_removercarrinho")) {
            const carrinho = await vendas.vlogs.get(`${interaction.channel.id}`);
            if(interaction.user.id !== carrinho.owner) return interaction.deferUpdate();
            const quantidade = parseInt(carrinho.quantidade);
            await interaction.reply({content:`${emoji.loading} | Aguarde um momento..`, ephemeral:true});
            const id = carrinho.produto;
            const prod = await db.get(`produto_${id}`);

            if(!prod) return interaction.editReply(`${emoji.aviso} | Não Encontrei o Banco de Dados desse Produto!`);

            if(quantidade - 1 < 1) {
                interaction.editReply({content:`${emoji.aviso} | Você não pode remover abaixo de 1!`})
                produ(id)
                return;
            }
            const cal = quantidade - 1;
            const tot = cal * prod.preco
            await vendas.vlogs.substr(`${interaction.channel.id}.quantidade`, 1);
            await vendas.vlogs.set(`${interaction.channel.id}.precototal`, tot)
            interaction.deleteReply();
            await produ(id)
        }

        async function produ(id) {
            const prod = await db.get(`produto_${id}`);
            const carrinho = await vendas.vlogs.get(`${interaction.channel.id}`);
            
            await interaction.message.edit({
                embeds:[
                    new EmbedBuilder()
                    .setDescription(`${emoji.prancheta}** | Produto:** \`${prod.nome}\` \n\n ${emoji.bagmoney}** | Quantidade:** \`${carrinho.quantidade}\` \n\n ${emoji.dinheiro}** | Preço:** \`R$${Number(prod.preco).toFixed(2) * Number(carrinho.quantidade)}\` \n\n ${emoji.carrinho}** | Quantidade disponivel:** \`${prod.conta.length}\``)
                ],
                components:[
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${user.id}_adicionarcarrinho`)
                        .setLabel("+")
                        .setStyle(2),
                        new ButtonBuilder()
                        .setCustomId(`${user.id}_modificarcarrinho`)
                        .setEmoji("✏")
                        .setStyle(3),
                        new ButtonBuilder()
                        .setCustomId(`${user.id}_removercarrinho`)
                        .setLabel("-")
                        .setStyle(2),
                    )
                ]
            });
        }
        if(customId === "termoscarrinho") {
            await interaction.reply({
                embeds:[
                    new EmbedBuilder()
                    .setTitle(`${interaction.guild.name} | Termos da Loja`)
                    .setDescription(`${await vendas.vconfig.get("terms")}`)
                ],
                ephemeral:true,
            })
        }
        async function edit(id) {
            if(interaction.isButton()) {
                const prod = await db.get(`${id}`);
                const embed = new EmbedBuilder()
                .setColor(prod.cor)
                .setTitle(`${prod.titulo}`)
                .setDescription(`${prod.desc} \n**${emoji.planeta} | Nome: ${prod.nome}\n${emoji.dinheiro} | Preço: R$${prod.preco}\n${emoji.caixa} | Estoque: ${prod.conta.length}**`);
                if(prod.banner.startsWith("https://")) {
                    embed.setImage(prod.banner);
                } 
    
                if(prod.thumbnail.startsWith("https://")) {
                    embed.setThumbnail(prod.thumbnail);
                } 
                await interaction.message.edit({
                embeds:[embed],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId(`${customId.split("_")[0]}_produto`)
                        .setLabel("Comprar")
                        .setEmoji(emoji.carrinho)
                        .setStyle(3)
                    )
                ]
            })
        } else {
            const id = customId.split("_")[0];
            const pn = await vendas.db.get(`painel_${customId.split("_")[0]}`);
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

            setTimeout(() => {
                interaction.message.edit({
                    embeds:[embed],
                    components:[
                        new ActionRowBuilder()
                        .addComponents(select)
                    ]
                })
            }, 1000);
        }
        }
        function resettime(chn) {
            const cooldown = vendas.vconfig.get("tempopagar");
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(async() => {
                try {
                    await chn.delete().catch((err) => {console.log(err.message)});
                } catch {
                    console.log("Canal Não Existe")
                }
                const carrinho = await vendas.vlogs.get(`${chn.id}`);
                if(carrinho) {
                    const user = interaction.guild.members.cache.get(carrinho.owner);
                    if(user) {
                        await user.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Compra Cancelada`)
                                .setDescription(`Olá ${user}, \n\n• A sua compra foi cancelada por **inatividade**, e todos os produtos foram devolvidos para o estoque. Você pode voltar a comrpar quando quiser!`)
                            ]
                        }).catch((err) => {console.log(`Usuario com privado bloqueado`)});
                    }
                    await vendas.vlogs.delete(`${chn.id}`);
                }
                const logs = interaction.guild.channels.cache.get(await vendas.vconfig.get("logs"));
                if(logs) {
                    logs.send({
                        embeds:[
                            new EmbedBuilder()
                            .setColor("Red")
                            .setTitle(`${interaction.guild.name} | Compra Cancelada`)
                            .setThumbnail(interaction.member.avatarURL())
                            .setTimestamp()
                            .addFields(
                                {
                                    name:`${emoji.usuario} | Usuário:`,
                                    value:`\`${interaction.user.username} - ${interaction.user.id}\``
                                },
                                {
                                    name:`${emoji.papel} | Motivo`,
                                    value:`\`Cancelada por inatividade.\``
                                },
                                {
                                    name:`${emoji.horario} | Data / Horário:`,
                                    value:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`
                                },
                            )
                            .setFooter({text:`${interaction.user.username} - ${interaction.user.id}`,iconURL:interaction.member.avatarURL(),})
                        ]
                    })
                }
                
            }, Number(cooldown) * 60 * 60 * 1000);
            }
    }}