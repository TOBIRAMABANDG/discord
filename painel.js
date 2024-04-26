const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const vendas = require("../../DataBase/vindex");
const ticket = require("../../DataBase/tindex");
const emoji = require("../../DataBase/emojis.json");
const owner = require("../../DataBase/owner.json");

async function configembed(interaction, client) {
    const customId = interaction.customId;
    const userid = customId.split("_")[0];
    const id = customId.split("_")[1];
    await interaction.update({content:`${emoji.loading} | Aguarde um momento...`, embeds:[], components:[]});
    const pn = await vendas.db.get(`painel_${id}`);
    let banner = "Não Configurado";
    let miniatura = "Não Configurado";

    if(pn.banner.startsWith("https://")) {
        banner = `[Banner](${pn.banner})`
    }
    if(pn.thumbnail.startsWith("https://")) {
        miniatura = `[Miniatura](${pn.thumbnail})`
    }
    
    await interaction.message.edit({
        content:"",
        embeds:[
            new EmbedBuilder()
            .setTitle(`Titulo Atual: ${pn.titulo}`)
            .setDescription(`${emoji.papel}** | Descrição Atual:** \n ${pn.desc} \n\n ${emoji.baguio} | Cor da Embed: ${pn.cor} \n ${emoji.caderno} | Text do Place Holder: ${pn.placeholder} \n ${emoji.pasta} | Banner: ${banner} \n ${emoji.imagem} | Miniatura: ${miniatura}`)
            .setFooter({text:`Rodapé Atual: ${pn.rodape}`})
        ],
        components:[
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_tituloembedpainel`)
                .setLabel("Título da embed")
                .setStyle(1)
                .setEmoji(emoji.engrenagem),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_descembedpainel`)
                .setLabel("Descrição da embed")
                .setStyle(1)
                .setEmoji(emoji.engrenagem),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_rodapeembedpainel`)
                .setLabel("Rodapé da embed")
                .setStyle(1)
                .setEmoji(emoji.engrenagem),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_placeholderembedpainel`)
                .setLabel("Place Holder")
                .setStyle(1)
                .setEmoji(emoji.engrenagem),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_corembedpainel`)
                .setLabel("Cor embed")
                .setStyle(1)
                .setEmoji(emoji.pincel),
            ),
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_bannerembedpainel`)
                .setLabel("Banner")
                .setEmoji(emoji.imagem)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_miniaturaembedpainel`)
                .setLabel("Miniatura")
                .setEmoji(emoji.imagem)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_atualizarpainel`)
                .setLabel("Atualizar Painel")
                .setStyle(1)
                .setEmoji(emoji.loading),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_voltarpainel`)
                .setLabel("Voltar")
                .setEmoji(emoji.voltar)
                .setStyle(1),
            )
        ]
    });

    
}

async function configembededit(interaction, client) {
    const customId = interaction.customId;
    const userid = customId.split("_")[0];
    const id = customId.split("_")[1];
    const pn = await vendas.db.get(`painel_${id}`);
    let banner = "Não Configurado";
    let miniatura = "Não Configurado";

    if(pn.banner.startsWith("https://")) {
        banner = `[Banner](${pn.banner})`
    }
    if(pn.thumbnail.startsWith("https://")) {
        miniatura = `[Miniatura](${pn.thumbnail})`
    }
    
    await interaction.message.edit({
        content:"",
        embeds:[
            new EmbedBuilder()
            .setTitle(`Titulo Atual: ${pn.titulo}`)
            .setDescription(`${emoji.papel}** | Descrição Atual:** \n ${pn.desc} \n\n ${emoji.baguio} | Cor da Embed: ${pn.cor} \n ${emoji.caderno} | Text do Place Holder: ${pn.placeholder} \n ${emoji.pasta} | Banner: ${banner} \n ${emoji.imagem} | Miniatura: ${miniatura}`)
            .setFooter({text:`Rodapé Atual: ${pn.rodape}`})
        ],
        components:[
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_tituloembedpainel`)
                .setLabel("Título da embed")
                .setStyle(1)
                .setEmoji(emoji.engrenagem),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_descembedpainel`)
                .setLabel("Descrição da embed")
                .setStyle(1)
                .setEmoji(emoji.engrenagem),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_rodapeembedpainel`)
                .setLabel("Rodapé da embed")
                .setStyle(1)
                .setEmoji(emoji.engrenagem),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_placeholderembedpainel`)
                .setLabel("Place Holder")
                .setStyle(1)
                .setEmoji(emoji.engrenagem),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_corembedpainel`)
                .setLabel("Cor embed")
                .setStyle(1)
                .setEmoji(emoji.pincel),
            ),
            new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_bannerembedpainel`)
                .setLabel("Banner")
                .setEmoji(emoji.imagem)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_miniaturaembedpainel`)
                .setLabel("Miniatura")
                .setEmoji(emoji.imagem)
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_atualizarpainel`)
                .setLabel("Atualizar Painel")
                .setStyle(1)
                .setEmoji(emoji.loading),
                new ButtonBuilder()
                .setCustomId(`${userid}_${id}_voltarpainel`)
                .setLabel("Voltar")
                .setEmoji(emoji.voltar)
                .setStyle(1),
            )
        ]
    });

    
}

async function configprod(interaction, client) {
    const customId = interaction.customId;
    const userid = customId.split("_")[0];
    const db = vendas.db;
    const id = customId.split("_")[1];
    await interaction.update({content:`${emoji.loading} | Aguarde um momento...`, embeds:[], components:[]});
    const pn = await vendas.db.get(`painel_${id}`);
    let msg = "";
    let counter = 0;
    await pn.idprodutos
  .sort((a, b) => b - a) 
  .map(async (rs, index) => {
    const prod = await db.get(`produto_${rs}`);
    if (prod) {
      msg += `${emoji.carrinho}** | __${index + 1}°__ - ${emoji.caixa} | ID:** ${rs}\n`;
      counter++;
    }
  });

    setTimeout(async() => {
        await interaction.message.edit({
            content:"",
            embeds:[
                new EmbedBuilder()
                .setTitle(`Estes são os produtos cadastrados no Painel:`)
                .setDescription(`${msg}`)
            ],
            components:[
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_addproductpainel`)
                    .setStyle(3)
                    .setLabel("Adicionar Produto")
                    .setEmoji(emoji.adicionar)
                    .setDisabled(counter >= 25? true : false),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_removerproductpainel`)
                    .setStyle(2)
                    .setLabel("Remover Produto")
                    .setEmoji(emoji.remover)
                    .setDisabled(counter <= 1 ? true : false),
                ),
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_atualizarpainel`)
                    .setLabel("Atualizar Painel")
                    .setStyle(1)
                    .setEmoji(emoji.loading),
                    new ButtonBuilder()
                    .setCustomId(`${userid}_${id}_voltarpainel`)
                    .setLabel("Voltar")
                    .setEmoji(emoji.voltar)
                    .setStyle(1),
                )
            ]
        })
    }, 1600);
    
}
module.exports = {
    configembed,
    configembededit,
    configprod,
}

    // db.set(`painel_${id}`, {
    //     idpainel:id,
    //     titulo: "Titulo Não Configurado",
    //     desc:"Descrição Não Configurado",
    //     idprodutos:[],
    //     mensagem:{
    //         id: msg.id,
    //         channelid: interaction.channel.id
    //     },
    //     banner: "Sem Banner",
    //     thumbnail: "Sem Thumbnail",
    //     cor: "#000000",
    //     rodape: "Sem Rodapé",
    //     placeholder: "Selecione um Produto"
    // });