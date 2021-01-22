// bot que responde algumas perguntas para demonstrar funcionalidades
// nele existe uma API que diz a temperatura em sua localização atual
// basta ir na pergunta 'Posso mesmo automalizar tarefas?' e enviar sua
// localização quando o bot pedir.


// bibliotecas
const env = require('../../.env')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra') // para teclado
const Markup = require('telegraf/markup')
const axios = require('axios') // para requisições remotas

// bot
const bot = new Telegraf(env.token)

const tecladoOpcoes = Markup.keyboard([
    ['O que são bots?', 'O que verei no curso?'],
    ['Posso mesmo automatizar tarefas?'],
    ['Como comprar o curso?']
]).resize().extra()

const botoes = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('Sim', 's'),
    Markup.callbackButton('Não', 'n')
], {columns:2}))

const localizacao = Markup.keyboard([
    Markup.locationRequestButton('Clique aqui para enviar sua localização')
]).resize().oneTime().extra()

bot.start(async ctx => {
    const nome = ctx.update.message.from.first_name
    await ctx.replyWithMarkdown(`*Olá, ${nome}!*\nEu sou o Bang o bot do curso`)
    await ctx.replyWithPhoto('https://static.wikia.nocookie.net/onepunchman/images/f/fb/Bang_Manga_Profile.png/revision/latest/scale-to-width-down/310?cb=20200106183401')
    await ctx.replyWithMarkdown(`_Posso te ajudar em algo?_`, tecladoOpcoes)
})

bot.hears('O que são bots?', ctx => {
    ctx.replyWithMarkdown('Um software que conversa com uma pessoa de maneira tão natural quanto você é capaz de imaginar, atendendo suas necessidades de forma rápida e assertiva.\n_Algo mais?_', tecladoOpcoes)
})

bot.hears('O que verei no curso?', async ctx => {
    await ctx.replyWithMarkdown('No *curso* ... criaremos vários *projetos*')
    await ctx.replyWithMarkdown('1. Um bot que vai gerenciar a sua lista de compras')
    await ctx.replyWithMarkdown('2. um bot que vai permitir cadastrar seus eventos')
    await ctx.replyWithMarkdown('E muitos outros.')
    await ctx.replyWithMarkdown('\n\n_Algo mais?_', tecladoOpcoes)
})

// Respondendo perguntas setadas do teclado
bot.hears('Posso mesmo automatizar tarefas?', async ctx => {
    await ctx.replyWithMarkdown('Claro que sim, o bot servirá...\nQuer uma palinha?', botoes)
})

bot.hears('Como comprar o curso?', ctx => {
    ctx.replyWithMarkdown('Que bom ... [link]')
})

bot.action('n', async ctx => {
    ctx.reply('Ok, não precisa ser grosso :(', tecladoOpcoes)
})

bot.action('s', async ctx => {
    await ctx.reply(`Que legal, tente me enviar sua localização, 
        ou escreva qualquer coisa...`, localizacao)
})

bot.hears(/mensagem qualquer/i, async ctx => {
    await ctx.replyWithMarkdown(`Essa piada é velha, tente outra...`, tecladoOpcoes)
})

bot.on('text', async ctx => {
    let msg = ctx.message.text
    msg = msg.split('').reverse().join('')
    await ctx.reply(`A sua mensagem ao contrário é ${msg}`)
    await ctx.reply('Isso mostra que eu consigo ler o que você escreve...', tecladoOpcoes)
})

bot.on('location', async ctx => {
    try {
        const url = 'http://api.openweathermap.org/data/2.5/weather'
        const { latitude: lat, longitude: lon } = ctx.message.location
        // console.log(lat, lon)
        const res = await axios.get(`${url}?lat=${lat}&lon=${lon}&APPID=9fd17c185b1b204135013723175aa656&units=metric`)
        await ctx.reply(`Hum... Você está em ${res.data.name}`)
        await ctx.reply(`A temperatura por aí está em ${res.data.main.temp}°C`, tecladoOpcoes)
    } catch(e) {
        ctx.reply(`Estou tendo problemas para pegar a tua localização, Você está no planeta terra? :P`, tecladoOpcoes)
    }
})


bot.startPolling()


