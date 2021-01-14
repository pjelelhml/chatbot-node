// Este é um programa que cria um teclado virtual para o 
// usuário interagir de forma rápida e prática

const env = require('../.env')
const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const bot = new Telegraf(env.token)

const tecladoDeTudo = Markup.keyboard([
    ['🧠 Cérebro', '🦴 Osso', '💋 Boca'],
    ['👨‍🚀 Astronalta','🎅 Papai noel', '🧙 Merlin'],
    ['👯‍♀️ Dançarinas', '☂️ Guarda-chuva', '🩱 Maiô'],
    ['👑 Coroa', '💍 Aliança', '👱🏻‍♀️ Loira']
]).resize().extra()

bot.start(async ctx => {
    await ctx.reply(`Seja bem vindo, ${ctx.update.message.from.first_name}!`)
    await ctx.reply(`Qual bebida você prefere?`,
        Markup.keyboard(['Coca', 'Pepsi']).resize().oneTime().extra())
})

bot.hears(['Coca', 'Pepsi'], async ctx => {
    await ctx.reply(`Nossa! Eu também gosto de ${ctx.match}`)
    await ctx.reply('Escolha alguma coisa!', tecladoDeTudo)
})

bot.hears('🧙 Merlin', ctx => ctx.reply('O merlin é um mago incrível'))
bot.hears('💍 Aliança', ctx => ctx.reply('Ah o compromisso, muito bom, embora custoso!!'))
bot.on('text', ctx => ctx.reply('Legal!'))

bot.startPolling()