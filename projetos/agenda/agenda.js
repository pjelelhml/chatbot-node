// bibliotecas
const env = require('../../.env')
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const moment = require('moment')

// scenes
// session é necessária qnd trabalhar com os fluxos das scenes
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')

const { getAgenda,
        getTarefa,
        getTarefas,
        getConcluidas,
        concluirTarefa,
        excluirTarefa,
        incluirTarefa,
        atualizarDataTarefa,
        atualizarObsTarefa, } = require('./agendaServicos')

//bot
const bot = new Telegraf(env.token)



bot.start(ctx => {
    const nome = ctx.update.message.from.first_name
    ctx.reply(`Seja bem vindo, ${nome}!`)
})

const formatarData = data => 
    data ? moment(data).format('DD/MM/YYYY'): ''

const exibirTarefa = async (ctx, tarefaId, novaMsg = false) => {
    const tarefa = await getTarefa(tarefaId)
    const conclusao = tarefa.dt_conclusao ?
        `\n<b>Concluída em </b> ${formatarData(tarefa.dt_conclusao)}`: ''
    const msg = `
        <b>${tarefa.descricao}</b>
        <b>Previsão:</b> ${formatarData(tarefa.dt_previsao)}${conclusao}
        <b>Observações:</b>\n${tarefa.observacao || ''}
    `

    if(novaMsg) {
        ctx.reply(msg, botoesTarefa(tarefaId))
    } else {
        ctx.editMessageText(msg, botoesTarefa(tarefaId))
    }
}

const botoesAgenda = tarefas => {
    const botoes = tarefas.map(item => {
        const data = item.dt_previsao ?
            `${moment(item.dt_previsao).format('DD/MM/YYYY')} - `: ''
        return [Markup.callbackButton(`${data}${item.descricao}`, `show ${item.id}`)]
    })
    return Extra.markup(Markup.inlineKeyboard(botoes, { colums: 1 }))
}

const botoesTarefa = idTarefa => Extra.HTML().markup(Markup.inlineKeyboard([
    Markup.callbackButton('✔️', `concluir ${idTarefa}`),
    Markup.callbackButton('📅', `setData ${idTarefa}`),
    Markup.callbackButton('💬', `addNota ${idTarefa}`),
    Markup.callbackButton('❌', `excluir ${idTarefa}`),
], { colums: 4 }))

// comandos do bot

bot.command('dia', async ctx => {
    const tarefas = await getAgenda(moment())
    ctx.reply(`Aqui está a sua agenda do dia`, botoesAgenda(tarefas))
})

bot.command('amanha', async ctx => {
    const tarefas = await getAgenda(moment().add({ day: 1 }))
    ctx.reply(`Aqui está a sua agenda até amanhã`, botoesAgenda(tarefas))
})

bot.command('semana', async ctx => {
    const tarefas = await getAgenda(moment().add({ week: 1 }))
    ctx.reply(`Aqui está a sua agenda da semana`, botoesAgenda(tarefas))
})

bot.command('concluídas', async ctx => {
    const tarefas = await getConcluidas()
    ctx.reply(`Aqui estão as tarefas que você já concluuiu`, botoesAgenda(tarefas))
})

bot.command('tarefas', async ctx => {
    const tarefas = await getTarefas()
    ctx.reply(`Aqui estão as tarefas sem data definida`, botoesAgenda(tarefas))
})

// ação do bot

bot.action(/show (.+)/, async ctx => {
    await exibirTarefa(ctx, ctx.match[1])
})

bot.action(/concluir (.+)/, async ctx => {
    await concluirTarefa(ctx.match[1])
    await exibirTarefa(ctx, ctx.match[1])
    await ctx.reply('Tarefa Concluída')
})

bot.action(/excluir (.+)/, async ctx => {
    await excluirTarefa(ctx.match[1])
    await ctx.editMessageText(`Tarefa Excluída`)
})

const tecladoDatas = Markup.keyboard([
    ['Hoje', 'Amanhã'],
    ['1 Semana', '1 Mês']
]).resize().oneTime().extra()

let idTarefa = null

const dataScene = new Scene('data')

dataScene.enter(ctx => {
    idTarefa = ctx.match[1]
    ctx.reply(`Gostaria de definir alguma data?`, tecladoDatas)
})

dataScene.leave(ctx => idTarefa = null)

// utilização de hears pois tecladoDatas é como se fosse digitado
dataScene.hears(/hoje/gi, async ctx => {
    const data = moment()
    handleData(ctx, data)
})

dataScene.hears(/(Amanh[ãa])/gi, async ctx => {
    const data = moment().add({ days:1 })
    handleData(ctx, data)
})

// ^ não permite palavras antes
dataScene.hears(/^(\d+) dias?$/gi, async ctx => {
    const data = moment().add({ days: ctx.match[1] })
    handleData(ctx, data)
})

dataScene.hears(/^(\d+) semanas?/gi, async ctx => {
    const data = moment().add({ week: ctx.match[1] })
    handleData(ctx, data)
})

dataScene.hears(/^(\d+) m[eê]s(es)?/gi, async ctx => {
    const data = moment().add({ month: ctx.match[1] })
    handleData(ctx, data)
})

dataScene.hears(/(\d{2}\/\d{2}\/\d{4})/g, async ctx => {
    const data = moment(ctx.match[1], 'DD/MM/YYYY')
    handleData(ctx, data)
})

const handleData = async (ctx, data) => {
    await atualizarDataTarefa(idTarefa, data)
    await ctx.reply(`Data atualizada!`)
    await exibirTarefa(ctx, idTarefa, true)
    ctx.scene.leave()
}

dataScene.on('message', ctx => 
    ctx.reply(`Padrões aceitos\ndd/MM/YYYY\nX semanas\nX meses`))

// observação scene

const obsScene = new Scene('observacoes')

obsScene.enter(ctx => {
    idTarefa = ctx.match[1]
    ctx.reply(`Já pode adicionar suas anotações...`)
})

obsScene.leave(ctx => idTarefa = null)

obsScene.on('text', async ctx => {
    const tarefa = await getTarefa(idTarefa)
    const  novoTexto = ctx.update.message.text
    const obs = tarefa.observacao ?
        tarefa.observacao + '\n---\n' + novoTexto : novoTexto
    const res = await atualizarObsTarefa(idTarefa, obs)
    await ctx.reply(`Observação adicionada!`)
    await exibirTarefa(ctx, idTarefa, true)
    ctx.scene.leave()
})

obsScene.on('message', ctx => 
    ctx.reply(`Apenas observações em texto são aeitas`))




const stage = new Stage([dataScene, obsScene])
bot.use(session())
bot.use(stage.middleware())

bot.action(/setData (.+)/, Stage.enter('data'))
bot.action(/addNota (.+)/, Stage.enter('observacoes'))

// inserção de tarefas

bot.on('text', async ctx => {
    try {
        const tarefa = await incluirTarefa(ctx.update.message.text)
        await exibirTarefa(ctx, tarefa.id, true)
    } catch (err) {
        console.log(err)
    }
})

bot.startPolling()