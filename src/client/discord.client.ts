import { MsgSerialize } from '@constant/constant.constant'
import { Client, ClientOptions, Collection, Message } from 'discord.js'
import { client } from 'main'

export class DiscordClient {
    constructor(private options: ClientOptions) {}
    private discordClient = new Client(this.options)
    public commands = new Collection()

    login(token: string) {
        this.discordClient.on('ready', async () => console.log(`Logged in as ${this.discordClient.user.tag}!`))
        this.discordClient.login(token)
        return token
    }

    client() {
        return this.discordClient
    }

    on(command: string, alias: string[], callback: (msg: MsgSerialize, data?: { message: Message }) => any) {
        client.commands.set(command, { alias, callback })
    }
}
