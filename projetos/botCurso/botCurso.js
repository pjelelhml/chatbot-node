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

bot.startPolling()


