import { Message } from 'discord.js'
import { MessageSerialize } from '@utils/utils.utils'
import dotenv from 'dotenv'
import { client } from 'main'
dotenv.config()

export const MessageHandler = async (message: Message) => {
    if (message.author.bot) return
    const msg = await MessageSerialize(message)
    const command = client.commands.get(msg.command)
    if (command) command['callback'](msg, { message })
}
