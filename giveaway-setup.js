const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const { createTranscript } = require("discord-html-transcripts");

const db = new QuickDB({ table: "ticket" });
const emoji = require("../../DataBase/emojis.json");

const sorteiosEmAndamento = {};

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "giveaway_setup_modal") {
                const title = interaction.fields.getTextInputValue("title") || "";
                const desc = interaction.fields.getTextInputValue("desc") || "";
                const banner = interaction.fields.getTextInputValue("banner") || null;
                const tempo = interaction.fields.getTextInputValue("tempo") || "";
                const quantia = interaction.fields.getTextInputValue("quantia") || 1;
        
                const tempoEmMilissegundos = converterTempoParaMilissegundos(tempo);
                const dataEncerramento = new Date(Date.now() + tempoEmMilissegundos);
                const timestampEncerramento = dataEncerramento.getTime();
        
                const participarButton = new ButtonBuilder()
                    .setCustomId("participar_button")
                    .setLabel("Participar")
                    .setEmoji("🎉")
                    .setStyle(1);
        
                try {
                    await interaction.reply({ content: "Envie a cor da embed \n\n Caso queira aleatorio digite: aleatorio", ephemeral: false });
        
                    const colorMessageCollector = interaction.channel.createMessageCollector({
                        filter: (collected) => collected.author.id === interaction.user.id,
                        time: 60000,
                        max: 1,
                    });
        
                    colorMessageCollector.on("collect", async (collected) => {
                        const color = collected.content;
                
            let cor = color;
                        if(color === "Somente preto") {
                            cor = "black"
                        }
                        try {
                            
                            const embed = new EmbedBuilder()
                                .setTitle(`${title}`)
                                .setDescription(`${desc} \n\n${emoji.horario} | Acabará em <t:${Math.floor(timestampEncerramento / 1000)}:f> (<t:${Math.floor(timestampEncerramento / 1000)}:R>)`)
                                .setImage(banner)
                                .setColor(color);
        
                            const mensagemSorteio = await interaction.channel.send({
                                embeds: [embed],
                                components: [new ActionRowBuilder().addComponents(participarButton)],
                            }).catch(() => {
                                interaction.editReply({content:`Sorteio Cancelado, A Cor digitada não existe...`});
                                return;
                            })
        
                            sorteiosEmAndamento[mensagemSorteio.id] = {
                                channel: interaction.channel,
                                timestampEncerramento: timestampEncerramento,
                                quantia: quantia,
                                participantes: [],
                                title: title,
                                criadorId: interaction.user.id,
                            };
        
                            const rerollButton = new ButtonBuilder()
                                .setCustomId("reroll_button")
                                .setLabel("Reroll")
                                .setEmoji(emoji.loading)
                                .setStyle(1);
        
                            await mensagemSorteio.edit({
                                components: [new ActionRowBuilder().addComponents(participarButton, rerollButton)],
                            });
        
                            await interaction.editReply({ content: `${emoji.sim} | Sorteio Criado com Sucesso!`, ephemeral: true });
        
                            setTimeout(() => encerrarSorteio(mensagemSorteio.id), tempoEmMilissegundos);
                        } catch {
                            interaction.editReply({content:`Sorteio Cancelado, A Cor digitada não existe...`});
                            return;
                        }

        
                        colorMessageCollector.stop();
                    });
        
                    colorMessageCollector.on("end", (collected, reason) => {
                        if (reason === "time") {
                            interaction.followUp({ content: "Tempo esgotado. O sorteio será criado com a cor padrão.", ephemeral: true });
                        }
                    });
                } catch {
                    interaction.reply({ content: `${emoji.aviso} | Coloque um Banner Válido!`, ephemeral: true });
                }
            }
        }
        else if (interaction.isButton()) {
            if (interaction.customId === "participar_button") {
                
                const sorteioAtual = sorteiosEmAndamento[interaction.message.id];
                if (sorteioAtual && Date.now() < sorteioAtual.timestampEncerramento) {
                    const participantes = sorteioAtual.participantes;

                    if (!participantes.includes(interaction.user.id)) {
                        participantes.push(interaction.user.id);
                        interaction.reply({ content: `✅ ${interaction.user.username}, você está participando do sorteio!`, ephemeral: true });
                    } else {
                        participantes.splice(participantes.indexOf(interaction.user.id), 1);
                        interaction.reply({ content: `🚪 ${interaction.user.username}, Você saiu do Sorteio!`, ephemeral: true });
                    }
                } else {
                    interaction.reply({ content: `${emoji.aviso} | Desculpe, o sorteio já terminou. Não é possível participar mais.`, ephemeral: true });
                }
            } else if (interaction.customId === "reroll_button") {
                const sorteioAtual = sorteiosEmAndamento[interaction.message.id];
                
                const criadorId = sorteioAtual.criadorId;
                if (interaction.user.id === criadorId) {
                    if (sorteioAtual && sorteioAtual.participantes.length > 0) {
                        const quantidadeRealParticipantes = sorteioAtual.participantes.length;
                        let quantidadeSorteio = sorteioAtual.quantia;

                        // Verifica se a quantidade especificada é maior que o número real de participantes
                        if (quantidadeSorteio > quantidadeRealParticipantes) {
                            quantidadeSorteio = quantidadeRealParticipantes;
                        }

                        const participantesTemporarios = [...sorteioAtual.participantes]; // Cria uma cópia do array de participantes

                        const vencedoresIds = [];
                        for (let i = 0; i < quantidadeSorteio; i++) {
                            // Garante que cada participante seja escolhido uma vez
                            const vencedorIndex = Math.floor(Math.random() * participantesTemporarios.length);
                            const vencedorId = participantesTemporarios.splice(vencedorIndex, 1)[0];
                            vencedoresIds.push(vencedorId);

                            const vencedor = await client.users.fetch(vencedorId);
                        }

                        const as = `🎉 | Novos ganhadores no reroll do sorteio **${sorteioAtual.title}**!`
                        const mensagemVencedores = `${as} \n${vencedoresIds.map((vencedorId) => vencedorId ? `<@${vencedorId}>` : '').join('')}`;

                        sorteioAtual.channel.send({ content: mensagemVencedores });
                        await interaction.reply({content:`${interaction.user} Reroll dado com sucesso!`, ephemeral:true});
                    }
                } else {
                    interaction.reply({ content: `${emoji.aviso} | Você não tem permissão para realizar o reroll.`, ephemeral: true });
                }
            }
        }

        function converterTempoParaMilissegundos(tempo) {
            const regex = /(\d+)([HhMmSs])/g;
            let match;
            let totalMilissegundos = 0;

            while ((match = regex.exec(tempo)) !== null) {
                const valor = parseInt(match[1]);
                const unidade = match[2].toLowerCase();

                switch (unidade) {
                    case 'd':
                        totalMilissegundos += valor * 24 * 60 * 60 * 1000;
                        break;
                    case 'h':
                        totalMilissegundos += valor * 60 * 60 * 1000;
                        break;
                    case 'm':
                        totalMilissegundos += valor * 60 * 1000;
                        break;
                    case 's':
                        totalMilissegundos += valor * 1000;
                        break;
                    default:
                        break;
                }
            }

            return totalMilissegundos;
        }

        async function encerrarSorteio(mensagemId) {
            const sorteioAtual = sorteiosEmAndamento[mensagemId];

            if (sorteioAtual) {
                const participantes = sorteioAtual.participantes;
                if (participantes.length > 0) {
                    const quantidadeSorteio = sorteioAtual.quantia;
                    const participantesTemporarios = [...participantes];

                    const vencedoresIds = [];
                    for (let i = 0; i < quantidadeSorteio; i++) {
                        // Garante que cada participante seja escolhido uma vez
                        const vencedorIndex = Math.floor(Math.random() * participantesTemporarios.length);
                        const vencedorId = participantesTemporarios.splice(vencedorIndex, 1)[0];
                        vencedoresIds.push(vencedorId);
                    }
                    const as = `🎉 | Parabéns aos ganhadores do sorteio **${sorteioAtual.title}**!`

                    const mensagemVencedores = `${as} \n${vencedoresIds.map((vencedorId) => vencedorId ? `<@${vencedorId}>` : '').join('')}`;

                    sorteioAtual.channel.send({ content: mensagemVencedores });

                } else {

                }
            }
        }
    },
};
