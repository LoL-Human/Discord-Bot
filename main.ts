import { DiscordClient } from 'src/client/discord.client'
import { MessageHandler } from 'src/handler/message.handler'
import { GlobSync } from 'glob'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

export const client = new DiscordClient({ intents: ['DIRECT_MESSAGES', 'GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] })
async function DiscordBot() {
    const command_files = new GlobSync('src/commands/*.ts').found
    command_files.push(...new GlobSync('src/commands/*/*.ts').found)
    command_files.forEach((command) => require(`${path.posix.join(__dirname, './')}/${command}`))

    const discordClient = client.client()
    client.login(process.env.TOKEN)
    discordClient.on('messageCreate', MessageHandler)
}
DiscordBot()
