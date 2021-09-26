import { Message } from 'discord.js'
import { MsgSerialize } from '@constant/constant.constant'
import dotenv from 'dotenv'
dotenv.config()

export const MessageSerialize = async (msg: Message) => {
    const m: MsgSerialize = {}
    m.msg_id = msg.id
    m.msg_from = `${msg.author.username}#${msg.author.discriminator}`
    m.msg_text = msg.content
    m.args = m.msg_text.startsWith(process.env.PREFIX) ? m.msg_text.slice(process.env.PREFIX.length).trim().split(/ +/) : []
    m.command = m.args.length != 0 ? m.args[0].toLowerCase() : ''
    m.args.shift()
    m.author_avatar = msg.author.avatarURL()
    return m
}
