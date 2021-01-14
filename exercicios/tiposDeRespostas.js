const env = require('../.env')
const Telegraf = require('telegraf')
const bot = new Telegraf(env.token)

bot.start(async ctx => {
    await ctx.reply(`Seja bem vindo, ${ctx.update.message.from.first_name}! 😈`)
    await ctx.replyWithHTML(`Destacando mensagem <b>HTML</b>
        <i>de várias</i> <code>formas</code> <pre>possíveis</pre>
        <a href="https://www.google.com">link</a>`)
    await ctx.replyWithMarkdown('Destacando mensagem *Markdown* '
        + '_de várias_ `formas` ```possíveis```'
        + ' [Google](https://www.google.com)')
    await ctx.replyWithPhoto({source: `${__dirname}/dog.jpg`})
    await ctx.replyWithPhoto('https://segredosdomundo.r7.com/wp-content/uploads/2019/03/ruivas-estao-cansadas-de-ouvir-6-822x1024.jpg',
        {caption: 'ruiva'})
    await ctx.replyWithPhoto({url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjozofibnnHN9hHNYnSJKrPjK-Vwb8iqpRKA&usqp=CAU'})
    await ctx.replyWithLocation(-30, 31)
    await ctx.replyWithVideo('https://youtu.be/ajJanul_K4k')
})

bot.startPolling()