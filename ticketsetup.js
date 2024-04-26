const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const next = require("../../DataBase/index");
const owner = require("../../DataBase/owner.json");
const { QuickDB } = require("quick.db");
const db = new QuickDB({table:"ticket"});
const {createTranscript} = require("discord-html-transcripts");

module.exports = {
    name:"interactionCreate",
    run:async(interaction, client) => {
        
        if(interaction.isButton()) {
            if(interaction.customId === "ticket") {
                const channel = await interaction.guild.channels.cache.find(ticket => ticket.topic === `ticket - ${interaction.user.id}`);
                if(channel) {
                    await interaction.reply({
                        content:`${emoji.aviso} | Você já tem um ticket aberto!`, 
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setURL(channel.url)
                                .setEmoji(emoji.ticket)
                                .setLabel("Ir para o Ticket")
                                .setStyle(5)
                            )
                        ],
                        ephemeral:true
                    });
                    return;
                }
                
            if(await ticket.tconfig.get("ticketonoff") === false) return interaction.reply({content:`${emoji.aviso} | O Sistema de Ticket está desabilitado...`, ephemeral:true});
                const modal = new ModalBuilder()
                .setCustomId(`modalabriticket`)
                .setTitle(`💢 - Sistema de Ticket`);

                const text = new TextInputBuilder()
                .setCustomId("text")
                .setStyle(2)
                .setRequired(true)
                .setLabel("como podemos ajudar?")
                .setPlaceholder("Descreva o motivo!");

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);
            }
        }
        if(interaction.isModalSubmit()) {
            if(interaction.customId === "modalabriticket") {
                const text = interaction.fields.getTextInputValue("text");
                await interaction.reply({content:`${emoji.loading} | Aguarde um momento, estou criando o seu ticket...`, ephemeral:true});
                let parent = interaction.guild.channels.cache.get(await ticket.tconfig.get("category"));
                if(!parent) parent = interaction.channel.parent;
                const permissionOverwrites = [
                    {
                        id: interaction.user.id,
                        allow:["ViewChannel", "SendMessages"],
                    },
                    {
                        id:interaction.guild.id,
                        deny:["ViewChannel", "SendMessages"]
                 
                    },
                ]
                const olr = interaction.guild.roles.cache.get(await ticket.tconfig.get("role"));
                if(olr) {
                    permissionOverwrites.push({
                        id: olr,
                        allow:["ViewChannel", "SendMessages"],
                    })
                }
                const cod = codigo();
                await interaction.guild.channels.create({
                    name:`🎫・${interaction.user.username}-${cod}`,
                    topic:`ticket - ${interaction.user.id}`,
                    parent: parent||interaction.channel.parent,
                    type: ChannelType.GuildText,
                    permissionOverwrites: permissionOverwrites
                }).then(async(channel) => {
                    await interaction.editReply({content:`${emoji.loading} | Aguarde um momento, carregando as mensagens...`});
                    const all = await ticket.embed.get("dentro");
                    const embed = new EmbedBuilder().setColor(all.cor)
                    let title = all.title;
                    title = title.replace(/#{username}/g, interaction.user.username);
                    title = title.replace(/#{userid}/g, interaction.user.id);
                    title = title.replace(/#{horarios.dia}/g, `<t:${Math.round(new Date().getTime() / 1000)}:f>`);
                    title = title.replace(/#{horarios.horas}/g, `<t:${Math.round(new Date().getTime() / 1000)}:R>`);
                    title = title.replace(/#{motivo}/g, text);
                    title = title.replace(/#{codigo}/g, cod);

                    embed.setTitle(title);

                    let desc = all.description;
                    desc = desc.replace(/#{user}/g, interaction.user);
                    desc = desc.replace(/#{username}/g, interaction.user.username);
                    desc = desc.replace(/#{userid}/g, interaction.user.id);
                    desc = desc.replace(/#{horarios.dia}/g, `<t:${Math.round(new Date().getTime() / 1000)}:f>`);
                    desc = desc.replace(/#{horarios.horas}/g, `<t:${Math.round(new Date().getTime() / 1000)}:R>`);
                    desc = desc.replace(/#{motivo}/g, text);
                    desc = desc.replace(/#{codigo}/g, cod);


                    embed.setDescription(desc);

                    if(all.footer !== "remover") {
                        embed.setFooter({text: `${all.footer}`});
                    } 
                    if(all.banner.startsWith("https://")) {
                        embed.setImage(all.banner);
                    }
                    let mencioanr = `${interaction.user}`;
                    if(olr) mencioanr += ` | ${olr}`
                    await channel.send({
                        content:`|| ${mencioanr} ||`,
                        embeds:[embed],
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId("create_call")
                                .setLabel("Criar Call")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.call),
                                new ButtonBuilder()
                                .setCustomId("notify_user")
                                .setLabel("Notificar Membro")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.sino),
                                new ButtonBuilder()
                                .setCustomId("fechar_ticket")
                                .setLabel("Fechar Ticket")
                                .setStyle(4)
                                .setEmoji(emoji.personalizados.fechar),
                            )
                        ]
                    }).then(() => {
                        interaction.editReply({
                            content:`${emoji.sim} | Ticket Aberto com sucesso!`,
                            components:[
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setURL(channel.url)
                                    .setLabel("Ir para o Ticket")
                                    .setStyle(5)
                                    .setEmoji(emoji.ticket)
                                )
                            ]
                        })
                    });
                    const logs = interaction.client.channels.cache.get(await ticket.tconfig.get("logs"));
                    if(logs) {
                        logs.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs-Ticket`)
                                .setThumbnail(interaction.client.user.displayAvatarURL())
                                .setFooter({text:`${interaction.guild.name} - Todos os Direitos reservados`})
                                .addFields(
                                    {
                                        name:`${emoji.usuario} | Usuario:`,
                                        value:`${interaction.user}  \`${interaction.user.username} - (${interaction.user.id})\``,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.despertador} | Horario:`,
                                        value:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.pasta} | Canal:`,
                                        value:`Nome: ${channel.name} - [Clique Aqui](${channel.url})`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.lupa} | Motivo:`,
                                        value:`\`\`\` ${text} \`\`\``,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.engrenagem} | Codigo:`,
                                        value:`\` ${cod} \``,
                                        inline:true
                                    },
                                )
                            ]
                        });
                    }


                    await db.set(`${channel.id}`, {
                        user: interaction.user.id,
                        horario:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`,
                        motivo: text,
                        codigo: cod,
                    })
                })

            }
        }

        if(interaction.isButton()) {
            const customId = interaction.customId;


            if(customId === "delete_call") {
                const user1 = interaction.guild.members.cache.get(interaction.user.id);
                const cargoId = interaction.guild.roles.cache.get(await ticket.tconfig.get("role"));
              
                const usucargo = user1.roles.cache.has(await ticket.tconfig.get("role"));
                if(!usucargo) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão dê usar este Botão!`, ephemeral:true});

                const tick = await db.get(`${interaction.channel.id}`);
                if(!tick) return interaction.reply({
                    content:`${emoji.aviso} | Ocorreu um erro ao tentar encontrar a database do ticket, deseja finaliza-lo?`, 
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`fechar_ticket`)
                            .setLabel("Deletar Ticket")
                            .setStyle(4)
                        )
                    ],
                    ephemeral:true
                });

                const user = interaction.guild.members.cache.get(tick.user);
                const permissionOverwrites = [
                    {
                        id:interaction.guild.id,
                        deny:["ViewChannel", "SendMessages"]
                    }
                ];
                if(user) {
                    permissionOverwrites.push({
                        id: user.id,
                        allow:["ViewChannel", "SendMessages"],
                    })
                } else {
                    return interaction.reply({content:`${emoji.aviso} | Não Conseguir encontrar o Dono do Ticket, parece que ele saiu do servidor!`, ephemeral:true});
                };
                if(cargoId) {
                    permissionOverwrites.push({
                        id: cargoId.id,
                        allow:["ViewChannel", "SendMessages"],
                    })
                }
                const channelchk = await interaction.guild.channels.cache.find(ticket => ticket.name === `📞-${user.user.username}`);
                if(!channelchk) {
                    await interaction.update({
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId("create_call")
                                .setLabel("Criar Call")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.call),
                                new ButtonBuilder()
                                .setCustomId("notify_user")
                                .setLabel("Notificar Membro")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.sino),
                                new ButtonBuilder()
                                .setCustomId("fechar_ticket")
                                .setLabel("Fechar Ticket")
                                .setStyle(4)
                                .setEmoji(emoji.personalizados.fechar),
                            )
                        ]
                    });
                    interaction.followUp({content:`${emoji.aviso} | Parece que não tem nenhuma call aberta`, ephemeral:true});
                    return;
                }

                await interaction.reply({content:`${emoji.loading} | Aguarde um momento estou deletando o canal..`, ephemeral:true});
                await channelchk.delete().then(() => {
                    interaction.editReply({
                        content:`${emoji.sim} | Canal Deletado Com Sucesso!`,
                    });
                    interaction.message.edit({
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId("create_call")
                                .setLabel("Criar Call")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.call),
                                new ButtonBuilder()
                                .setCustomId("notify_user")
                                .setLabel("Notificar Membro")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.sino),
                                new ButtonBuilder()
                                .setCustomId("fechar_ticket")
                                .setLabel("Fechar Ticket")
                                .setStyle(4)
                                .setEmoji(emoji.personalizados.fechar),
                            )
                        ]
                    });
                    const logs = interaction.client.channels.cache.get(ticket.tconfig.get("logs"));
                    if(logs) {
                        logs.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs-Ticket`)
                                .setDescription(`O Staff: ${interaction.user} (\`${interaction.user.username} - (${interaction.user.id})\`) Deletou um Canal no Ticket: ${interaction.channel.url}`)
                            ],
                            components:[
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setStyle(5)
                                    .setLabel("Ir para o Ticket")
                                    .setURL(interaction.channel.url)
                                )
                            ]
                        });
                    }
                }).catch((err) => {
                    interaction.editReply({
                        content:`${emoji.nao} | Ocorreu um erro ao tentar deletar a call \n\n Mensagem do Erro: ${err.message}`
                    });
                })
            }

            if(customId === "notify_user") {
                const user1 = interaction.guild.members.cache.get(interaction.user.id);
              
                const usucargo = user1.roles.cache.has(await ticket.tconfig.get("role"));
                if(!usucargo) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão dê usar este Botão!`, ephemeral:true});

                const tick = await db.get(`${interaction.channel.id}`);
                if(!tick) return interaction.reply({
                    content:`${emoji.aviso} | Ocorreu um erro ao tentar encontrar a database do ticket, deseja finaliza-lo?`, 
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`fechar_ticket`)
                            .setLabel("Deletar Ticket")
                            .setStyle(4)
                        )
                    ],
                    ephemeral:true
                });
                
                await interaction.reply({content:`${emoji.loading} | Aguarde um momento, estou notificando o Usuario...`, ephemeral:true});
                const member = interaction.guild.members.cache.get(tick.user);
                if(!member) return interaction.editReply({content:`${emoji.aviso} | Não Encontrei o Usuario no servidor!`,});
                try {
                    await member.send({
                        embeds:[
                            new EmbedBuilder()
                            .setDescription(`***${member.user.username}*** algum **STAFF** está lhe chamando no seu ***TICKET***`)
                            .setColor("Random")
                        ],
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setURL(interaction.channel.url)
                                .setStyle(5)
                                .setLabel("Ir para o Ticket")
                            )
                        ]
                    }).then(() => {
                        interaction.editReply({content:`${emoji.sim} | Usuario notificado com sucesso!`,})
                    }).catch(() => {
                        interaction.editReply({content:`${emoji.nao} | Usuario está com o privado bloqueado!`,})
                    })
                } catch (err){
                    interaction.editReply({content:`${emoji.nao} | Ocorreu um erro ao tentar enviar a mensagem para o Usuario \n\n Mensagem do erro: ${err.message}`})
                }
                
                const logs = interaction.client.channels.cache.get(await ticket.tconfig.get("logs"));
                if(logs) {
                    logs.send({
                        embeds:[
                            new EmbedBuilder()
                            .setTitle(`${interaction.guild.name} | Sistema de Logs-Ticket`)
                            .setDescription(`O Staff: ${interaction.user} (\`${interaction.user.username} - (${interaction.user.id})\`) Notificou o Usuario: ${member} (\`${member.user.username} - (${member.user.id})\`)`)
                        ],
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setStyle(5)
                                .setLabel("Ir para o Ticket")
                                .setURL(interaction.channel.url)
                            )
                        ]
                    });
                }
            }

            if(customId === "fechar_ticket") {
                const user1 = interaction.guild.members.cache.get(interaction.user.id);
              
                const usucargo = user1.roles.cache.has(await ticket.tconfig.get("role"));
                if(!usucargo) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão dê usar este Botão!`, ephemeral:true});

                const tick = await db.get(`${interaction.channel.id}`);
                if(!tick) return interaction.channel.delete();
                
                await interaction.reply({
                    embeds:[
                        new EmbedBuilder()
                        .setDescription(`Olá ${interaction.user}, o Ticket está sendo fechado dentro de alguns segundos`)
                        .setColor("Red")
                    ]
                });

                const file = await createTranscript(interaction.channel, {
                    filename:`${interaction.channel.name.toLowerCase()}-transcript.html`,
                });
                const logshtml = interaction.guild.channels.cache.get(await ticket.tconfig.get("logs_html"));
                if(logshtml) {
                    const msg = await logshtml.send({ files:[file]}).then(async(msg) => {
                        const logs = interaction.guild.channels.cache.get(await ticket.tconfig.get("logs"));
                        if(logs) {
                            const tick = await db.get(`${interaction.channel.id}`);
                            const user = interaction.client.users.cache.get(tick.user);
                            const horario = tick.horario;
                            const motivo = tick.motivo;
                            const cod = tick.codigo
                            if(user) {
                                user.send({
                                    embeds:[
                                        new EmbedBuilder()
                                        .setTitle(`${interaction.guild.name} | Sistema de Logs-Ticket`)
                                        .setThumbnail(interaction.client.user.displayAvatarURL())
                                        .setFooter({text:`${interaction.guild.name} - Todos os Direitos reservados`})
                                        .addFields(
                                            {
                                                name:`${emoji.usuario} | Usuario:`,
                                                value:`<@${tick.user}>  \`(${tick.user})\``,
                                                inline:true
                                            },
                                            {
                                                name:`${emoji.usuario} | Quem Fechou:`,
                                                value:`${interaction.user} (\`${interaction.user.username} - ${interaction.user.id}\`)`,
                                                inline:true
                                            },
                                            {
                                                name:`${emoji.despertador} | Horario Aberto:`,
                                                value:`${horario}`,
                                                inline:true
                                            },
                                            {
                                                name:`${emoji.despertador} | Horario Fechamento:`,
                                                value:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`,
                                                inline:true
                                            },
                                            {
                                                name:`${emoji.pasta} | Canal:`,
                                                value:`Nome: ${interaction.channel.name} ID: ${interaction.channel.id}`,
                                                inline:true
                                            },
                                            {
                                                name:`${emoji.lupa} | Motivo:`,
                                                value:`\`\`\` ${motivo} \`\`\``,
                                                inline:true
                                            },
                                            {
                                                name:`${emoji.engrenagem} | Codigo:`,
                                                value:`\` ${cod} \``,
                                                inline:true
                                            },
                                        )
                                    ],
                                    components:[
                                        new ActionRowBuilder()
                                        .addComponents(
                                            new ButtonBuilder()
                                            .setURL(`https://mahto.id/chat-exporter?url=${msg.attachments.first()?.url}`)
                                            .setStyle(5)
                                            .setLabel("Abrir Logs"),
                                            new ButtonBuilder()
                                            .setURL(`${msg.attachments.first()?.url}`)
                                            .setStyle(5)
                                            .setLabel("Baixar Logs"),
                                        )
                                    ]
                                }).catch(() => {
                                    console.log("Privado Bloqueado detectado")
                                })
                            }
                        await logs.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs-Ticket`)
                                .setThumbnail(interaction.client.user.displayAvatarURL())
                                .setFooter({text:`${interaction.guild.name} - Todos os Direitos reservados`})
                                .addFields(
                                    {
                                        name:`${emoji.usuario} | Usuario:`,
                                        value:`<@${tick.user}>  \`(${tick.user})\``,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.usuario} | Quem Fechou:`,
                                        value:`${interaction.user} (\`${interaction.user.username} - ${interaction.user.id}\`)`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.despertador} | Horario Aberto:`,
                                        value:`${horario}`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.despertador} | Horario Fechamento:`,
                                        value:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.pasta} | Canal:`,
                                        value:`Nome: ${interaction.channel.name} ID: ${interaction.channel.id}`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.lupa} | Motivo:`,
                                        value:`\`\`\` ${motivo} \`\`\``,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.engrenagem} | Codigo:`,
                                        value:`\` ${cod} \``,
                                        inline:true
                                    },
                                )
                            ],
                            components:[
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setURL(`https://mahto.id/chat-exporter?url=${msg.attachments.first()?.url}`)
                                    .setStyle(5)
                                    .setLabel("Abrir Logs"),
                                    new ButtonBuilder()
                                    .setURL(`${msg.attachments.first()?.url}`)
                                    .setStyle(5)
                                    .setLabel("Baixar Logs"),
                                )
                            ]
                        })
                        }
                    });
                } else { 
                    const logs = interaction.guild.channels.cache.get(await ticket.tconfig.get("logs"));
                if(logs) {
                    const tick = await db.get(`${interaction.channel.id}`);
                    const user = interaction.client.users.cache.get(tick.user);
                    const horario = tick.horario;
                    const motivo = tick.motivo;
                    const cod = tick.codigo
                    if(user) {
                        user.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs-Ticket`)
                                .setThumbnail(interaction.client.user.displayAvatarURL())
                                .setFooter({text:`${interaction.guild.name} - Todos os Direitos reservados`})
                                .addFields(
                                    {
                                        name:`${emoji.usuario} | Usuario:`,
                                        value:`<@${tick.user}>  \`(${tick.user})\``,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.usuario} | Quem Fechou:`,
                                        value:`${interaction.user} (\`${interaction.user.username} - ${interaction.user.id}\`)`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.despertador} | Horario Aberto:`,
                                        value:`${horario}`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.despertador} | Horario Fechamento:`,
                                        value:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.pasta} | Canal:`,
                                        value:`Nome: ${interaction.channel.name} ID: ${interaction.channel.id}`,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.lupa} | Motivo:`,
                                        value:`\`\`\` ${motivo} \`\`\``,
                                        inline:true
                                    },
                                    {
                                        name:`${emoji.engrenagem} | Codigo:`,
                                        value:`\` ${cod} \``,
                                        inline:true
                                    },
                                )
                            ]
                        }).catch(() => {
                            console.log("Privado Bloqueado detectado")
                        });
                    }
                await logs.send({
                    embeds:[
                        new EmbedBuilder()
                        .setTitle(`${interaction.guild.name} | Sistema de Logs-Ticket`)
                        .setThumbnail(interaction.client.user.displayAvatarURL())
                        .setFooter({text:`${interaction.guild.name} - Todos os Direitos reservados`})
                        .addFields(
                            {
                                name:`${emoji.usuario} | Usuario:`,
                                value:`<@${tick.user}>  \`(${tick.user})\``,
                                inline:true
                            },
                            {
                                name:`${emoji.usuario} | Quem Fechou:`,
                                value:`${interaction.user} (\`${interaction.user.username} - ${interaction.user.id}\`)`,
                                inline:true
                            },
                            {
                                name:`${emoji.despertador} | Horario Aberto:`,
                                value:`${horario}`,
                                inline:true
                            },
                            {
                                name:`${emoji.despertador} | Horario Fechamento:`,
                                value:`<t:${Math.round(new Date().getTime() / 1000)}:f> (<t:${Math.round(new Date().getTime() / 1000)}:R>)`,
                                inline:true
                            },
                            {
                                name:`${emoji.pasta} | Canal:`,
                                value:`Nome: ${interaction.channel.name} ID: ${interaction.channel.id}`,
                                inline:true
                            },
                            {
                                name:`${emoji.lupa} | Motivo:`,
                                value:`\`\`\` ${motivo} \`\`\``,
                                inline:true
                            },
                            {
                                name:`${emoji.engrenagem} | Codigo:`,
                                value:`\` ${cod} \``,
                                inline:true
                            },
                        )
                    ]
                })
                }
            }

            setTimeout(() => {
                interaction.channel.delete();
            }, 5000);
            }

            if(customId === "create_call") {
                const user1 = interaction.guild.members.cache.get(interaction.user.id);
                const cargoId = interaction.guild.roles.cache.get(await ticket.tconfig.get("role"));
              
                const usucargo = user1.roles.cache.has(await ticket.tconfig.get("role"));
                if(!usucargo) return interaction.reply({content:`${emoji.aviso} | Você não tem permissão dê usar este Botão!`, ephemeral:true});

                const tick = await db.get(`${interaction.channel.id}`);
                if(!tick) return interaction.reply({
                    content:`${emoji.aviso} | Ocorreu um erro ao tentar encontrar a database do ticket, deseja finaliza-lo?`, 
                    components:[
                        new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                            .setCustomId(`fechar_ticket`)
                            .setLabel("Deletar Ticket")
                            .setStyle(4)
                        )
                    ],
                    ephemeral:true
                });

                const user = interaction.guild.members.cache.get(tick.user);
                const permissionOverwrites = [
                    {
                        id:interaction.guild.id,
                        deny:["ViewChannel", "SendMessages"]
                    }
                ];
                if(user) {
                    permissionOverwrites.push({
                        id: user.id,
                        allow:["ViewChannel", "SendMessages"],
                    })
                } else {
                    return interaction.reply({content:`${emoji.aviso} | Não Conseguir encontrar o Dono do Ticket, parece que ele saiu do servidor!`, ephemeral:true});
                };
                if(cargoId) {
                    permissionOverwrites.push({
                        id: cargoId.id,
                        allow:["ViewChannel", "SendMessages"],
                    })
                }
                const channelchk = await interaction.guild.channels.cache.find(ticket => ticket.name === `📞-${user.user.username}`);
                if(channelchk) {
                    await interaction.update({
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId("delete_call")
                                .setLabel("Deletar Call")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.call),
                                new ButtonBuilder()
                                .setCustomId("notify_user")
                                .setLabel("Notificar Membro")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.sino),
                                new ButtonBuilder()
                                .setCustomId("fechar_ticket")
                                .setLabel("Fechar Ticket")
                                .setStyle(4)
                                .setEmoji(emoji.personalizados.fechar),
                            )
                        ]
                    });
                    interaction.followUp({content:`${emoji.aviso} | Parece que já tem uma call aberta ${channelchk}`, ephemeral:true});
                    return;
                }

                await interaction.reply({content:`${emoji.loading} | Aguarde um momento estou criando o canal..`, ephemeral:true});
                await interaction.guild.channels.create({
                    name: `📞-${user.user.username}`,
                    type: 2,
                    parent: interaction.channel.parent,
                    permissionOverwrites: permissionOverwrites
                }).then((chn) => {
                    interaction.editReply({
                        content:`${emoji.sim} | Criado Com Sucesso! \n\n Link do Canal: ${chn.url}`,
                    });
                    interaction.message.edit({
                        components:[
                            new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                .setCustomId("delete_call")
                                .setLabel("Deletar Call")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.call),
                                new ButtonBuilder()
                                .setCustomId("notify_user")
                                .setLabel("Notificar Membro")
                                .setStyle(1)
                                .setEmoji(emoji.personalizados.sino),
                                new ButtonBuilder()
                                .setCustomId("fechar_ticket")
                                .setLabel("Fechar Ticket")
                                .setStyle(4)
                                .setEmoji(emoji.personalizados.fechar),
                            )
                        ]
                    });
                    const logs = interaction.client.channels.cache.get(ticket.tconfig.get("logs"));
                    if(logs) {
                        logs.send({
                            embeds:[
                                new EmbedBuilder()
                                .setTitle(`${interaction.guild.name} | Sistema de Logs-Ticket`)
                                .setDescription(`O Staff: ${interaction.user} (\`${interaction.user.username} - (${interaction.user.id})\`) Criou um Canal no Ticket: ${interaction.channel.url} \n\n Link do Canal: ${chn.url}`)
                            ],
                            components:[
                                new ActionRowBuilder()
                                .addComponents(
                                    new ButtonBuilder()
                                    .setStyle(5)
                                    .setLabel("Ir para o Ticket")
                                    .setURL(interaction.channel.url)
                                )
                            ]
                        });
                    }
                }).catch((err) => {
                    interaction.editReply({
                        content:`${emoji.nao} | Ocorreu um erro ao tentar criar uma call \n\n Mensagem do Erro: ${err.message}`
                    });
                })
            }
        }
}}

function codigo() {
  var gerados = "";
  var codigos = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
   for (var i = 0; i < 8; i++)
     gerados += codigos.charAt(Math.floor(Math.random() * codigos.length));
   return gerados;
 }