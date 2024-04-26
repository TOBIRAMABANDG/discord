const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const owner = require("../../DataBase/owner.json");



async function config(interaction, client) {
    const customId = interaction.customId;
    const userid = customId.split("_")[0];
    const id = customId.split("_")[1];
    const prod = await vendas.db.get(`produto_${id}`);
    
    await interaction.update({
            content:``,
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
                .setDescription(`**${emoji.papel} | Descrição:**\n${prod.desc}\n\n${emoji.lupa} | Id: ${id}\n${emoji.planeta} | Nome: ${prod.nome}\n${emoji.dinheiro} | Preço: R$${prod.preco}\n${emoji.caixa} | Estoque quantidade: ${prod.conta.length}`)
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
        });
}

async function configedit(interaction, client) {
    const customId = interaction.customId;
    const userid = customId.split("_")[0];
    const id = customId.split("_")[1];
    const prod = await vendas.db.get(`produto_${id}`);
    
    await interaction.message.edit({
            content:``,
            embeds:[
                new EmbedBuilder()
                .setTitle(`${interaction.client.user.username} | Gerenciar Produto`)
                .setDescription(`**${emoji.papel} | Descrição:**\n${prod.desc}\n\n${emoji.lupa} | Id: ${id}\n${emoji.planeta} | Nome: ${prod.nome}\n${emoji.dinheiro} | Preço: R$${prod.preco}\n${emoji.caixa} | Estoque quantidade: ${prod.conta.length}`)
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
        });
}

async function stock(interaction, client) {
    const customId = interaction.customId;
    const userid = customId.split("_")[0];
    const id = customId.split("_")[1];
    const prod = await vendas.db.get(`produto_${id}`);
    const allstock = prod.conta;
    let msg = "";
    if(allstock.length <= 0) {
        msg = "**__Adicione algum Estoque__**"
    } else {
        let quantidadestock = 0;
        allstock.map((pd, index) => {
            ++quantidadestock
            if(quantidadestock < 70) {
                msg += `**${emoji.caixa} | ${index} - ${pd}**\n`;
            }
        });
    }
    await interaction.update({
        embeds:[
            new EmbedBuilder()
            .setTitle(`${interaction.guild.name} | Configurar Estoque`)
            .setColor("Random")
            .setDescription(`${msg}`)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({text:allstock.length > 70 ? `Você tem ${allstock.length} de estoque Faça Backup para ver-los` : "Esse é seu estoque completo!" })
        ],
        components:[
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_addstockprod`)
                .setLabel("ADICIONAR")
                .setStyle(3)
                .setEmoji(emoji.adicionar),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_removestockprod`)
                .setLabel("REMOVER")
                .setStyle(2)
                .setEmoji(emoji.remover),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_backupstockprod`)
                .setLabel("BACKUP")
                .setStyle(1)
                .setEmoji(emoji.backup),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_limparstockprod`)
                .setLabel("LIMPAR")
                .setEmoji(emoji.lixeira)
                .setStyle(4)
            ),
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attmsgprod`)
                .setLabel("Atualizar Mensagem")
                .setEmoji(emoji.loading)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarprod`)
                .setLabel("Voltar")
                .setEmoji(emoji.voltar)
                .setStyle(1),
            )
        ]
    })
}

async function stockedit(interaction, client) {
    const customId = interaction.customId;
    const userid = customId.split("_")[0];
    const id = customId.split("_")[1];
    const prod = await vendas.db.get(`produto_${id}`);
    const allstock = prod.conta;
    let msg = "";
    if(allstock.length <= 0) {
        msg = "**__Adicione algum Estoque__**"
    } else {
        let quantidadestock = 0;
        allstock.map((pd, index) => {
            ++quantidadestock
            if(quantidadestock < 20) {
                msg += `**${emoji.caixa} | ${index} - ${pd}** \n`;
            }
        });
    }
    await interaction.message.edit({
        embeds:[
            new EmbedBuilder()
            .setTitle(`${interaction.guild.name} | Configurar Estoque`)
            .setColor("Random")
            .setDescription(`${msg}`)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({text:allstock.length > 20 ? `Você tem ${allstock.length} de estoque Faça Backup para ver-los` : "Esse é seu estoque completo!" })
        ],
        components:[
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_addstockprod`)
                .setLabel("ADICIONAR")
                .setStyle(3)
                .setEmoji(emoji.adicionar),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_removestockprod`)
                .setLabel("REMOVER")
                .setStyle(2)
                .setEmoji(emoji.remover),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_backupstockprod`)
                .setLabel("BACKUP")
                .setStyle(1)
                .setEmoji(emoji.backup),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_limparstockprod`)
                .setLabel("LIMPAR")
                .setEmoji(emoji.lixeira)
                .setStyle(4)
            ),
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attmsgprod`)
                .setLabel("Atualizar Mensagem")
                .setEmoji(emoji.loading)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarprod`)
                .setLabel("Voltar")
                .setEmoji(emoji.voltar)
                .setStyle(1),
            )
        ]
    })
}

async function configadv(interaction, client) {
    const customId = interaction.customId;
    const userid = customId.split("_")[0];
    const id = customId.split("_")[1];
    const prod = await vendas.db.get(`produto_${id}`);
    let banner = "Não Configurado";
    let thumbnail = "Não Configurado";
    if(prod.banner.startsWith("https://")) {
        banner = `[Banner](${prod.banner})`
    }
    if(prod.thumbnail.startsWith("https://")) {
        thumbnail = `[Miniatura](${prod.thumbnail})`
    }

    await interaction.update({
        embeds:[
            new EmbedBuilder()
            .setTitle(`${interaction.guild.name} | Outras Configurações`)
            .setColor("Random")
            .setFooter({text:`${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL()})
            .setDescription(`${emoji.pasta} | Banner: ${banner} \n${emoji.imagem} | Miniatura: ${thumbnail} \n${emoji.pincel} | Cor Embed: ${prod.cor} \n${emoji.dinheiro} | Cupom: ${prod.cupom ? "Pode utilizar cupom nesse produto!" : "Não pode utilizar nenhum cupom nesse produto!"}`)
        ],
        components:[
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_bannerprod`)
                .setLabel("Banner")
                .setEmoji(emoji.imagem)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_miniaturaprod`)
                .setLabel("Miniatura")
                .setEmoji(emoji.imagem)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_corprod`)
                .setLabel("Cor Embed")
                .setEmoji(emoji.pincel)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_cupomprod`)
                .setLabel("Ativar/Desativar Cupons")
                .setEmoji(emoji.maoapertado)
                .setStyle(1),
            ),
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attmsgprod`)
                .setLabel("Atualizar Mensagem")
                .setEmoji(emoji.loading)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarprod`)
                .setLabel("Voltar")
                .setEmoji(emoji.voltar)
                .setStyle(1),
            )
        ]
    })
}

async function configadvedit(interaction, client) {
    const customId = interaction.customId;
    const userid = customId.split("_")[0];
    const id = customId.split("_")[1];
    const prod = await vendas.db.get(`produto_${id}`);
    let banner = "Não Configurado";
    let thumbnail = "Não Configurado";
    if(prod.banner.startsWith("https://")) {
        banner = `[Banner](${prod.banner})`
    }
    if(prod.thumbnail.startsWith("https://")) {
        thumbnail = `[Miniatura](${prod.thumbnail})`
    }

    await interaction.message.edit({
        embeds:[
            new EmbedBuilder()
            .setTitle(`${interaction.guild.name} | Outras Configurações`)
            .setColor("Random")
            .setFooter({text:`${interaction.client.user.username} - Todos os direitos reservados.`, iconURL: interaction.client.user.displayAvatarURL()})
            .setDescription(`${emoji.pasta} | Banner: ${banner} \n${emoji.imagem} | Miniatura: ${thumbnail} \n${emoji.pincel} | Cor Embed: ${prod.cor} \n${emoji.dinheiro} | Cupom: ${prod.cupom ? "Pode utilizar cupom nesse produto!" : "Não pode utilizar nenhum cupom nesse produto!"}`)
        ],
        components:[
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_bannerprod`)
                .setLabel("Banner")
                .setEmoji(emoji.imagem)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_miniaturaprod`)
                .setLabel("Miniatura")
                .setEmoji(emoji.imagem)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_corprod`)
                .setLabel("Cor Embed")
                .setEmoji(emoji.pincel)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_cupomprod`)
                .setLabel("Ativar/Desativar Cupons")
                .setEmoji(emoji.maoapertado)
                .setStyle(1),
            ),
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_attmsgprod`)
                .setLabel("Atualizar Mensagem")
                .setEmoji(emoji.loading)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${interaction.user.id}_${id}_voltarprod`)
                .setLabel("Voltar")
                .setEmoji(emoji.voltar)
                .setStyle(1),
            )
        ]
    })
}
module.exports = {
    config,
    configedit,
    stock,
    stockedit,
    configadv,
    configadvedit,
}