import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice'
import { client } from 'main'
import ytdl from 'ytdl-core'
import ytSearch from 'yt-search'

const queue = new Map()

client.on('play', ['skip', 'stop'], async (msg, { message }) => {
    const voice_channel = message.member?.voice.channel
    if (!voice_channel) return message.reply('You need to be in a channel to execute this command!')
    const permissions = voice_channel.permissionsFor(message.client.user)
    if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissins')
    if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissins')

    // const server_queue = queue.get(message.guild.id)

    if (msg.command === 'play') {
        if (!msg.args.length) return message.channel.send('You need to send the second argument!')
        let videoURL = ytdl.validateURL(msg.args[0]) ? msg.args[0] : (await ytSearch(msg.args[0])).videos[0].url
        const info = await ytdl.getInfo(videoURL)
        const url = ytdl.chooseFormat(info.formats, { quality: '18' }).url
        const connection = joinVoiceChannel({
            channelId: voice_channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        })
        const resource = createAudioResource(url, { inlineVolume: true })
        resource.volume.setVolume(0.2)
        const player = createAudioPlayer()
        connection.subscribe(player)
        player.play(resource)
        message.channel.send(`🎶 Now playing **${info.videoDetails.title}**`)
        // player.on('stateChange', async (_, newState) => {
        //     console.log(newState.status)
        // })
    }
})
