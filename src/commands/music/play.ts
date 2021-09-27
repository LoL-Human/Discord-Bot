import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice'
import { client } from 'main'
import ytdl from 'ytdl-core'
import ytSearch from 'yt-search'
import { Guild, Message } from 'discord.js'

const queue = new Map()

client.on('play', ['skip', 'stop'], async (msg, { message }) => {
    const voice_channel = message.member?.voice.channel
    if (!voice_channel) return message.reply('You need to be in a channel to execute this command!')
    const permissions = voice_channel.permissionsFor(message.client.user)
    if (!permissions.has('CONNECT')) return message.channel.send('You dont have the correct permissins')
    if (!permissions.has('SPEAK')) return message.channel.send('You dont have the correct permissins')

    const server_queue = queue.get(message.guild.id)

    if (msg.command === 'play') {
        if (!msg.args.length) return message.channel.send('You need to send the second argument!')
        let videoURL = ytdl.validateURL(msg.args[0]) ? msg.args[0] : (await ytSearch(msg.args[0])).videos[0].url
        const info = await ytdl.getInfo(videoURL)
        const url = ytdl.chooseFormat(info.formats, { quality: '18' }).url
        const song = { title: info.videoDetails.title, url }

        if (!server_queue) {
            const queue_constructor = {
                voice_channel: voice_channel,
                text_channel: message.channel,
                connection: null,
                player: null,
                songs: [],
            }

            queue.set(message.guild.id, queue_constructor)
            queue_constructor.songs.push(song)

            try {
                const connection = joinVoiceChannel({
                    channelId: voice_channel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                })

                queue_constructor.connection = connection
                video_player(message.guild, queue_constructor.songs[0])
            } catch (err) {
                queue.delete(message.guild.id)
                message.channel.send('There was an error connecting!')
                throw err
            }
        } else {
            server_queue.songs.push(song)
            return message.channel.send(`👍 **${song.title}** added to queue!`)
        }
    } else if (msg.command === 'skip') skip_player(message, server_queue)
    else if (msg.command === 'stop') stop_song(message, server_queue)
})

const video_player = async (guild: Guild, song: { title: string; url: string }) => {
    const song_queue = queue.get(guild.id)
    const resource = createAudioResource(song.url, { inlineVolume: true })
    resource.volume.setVolume(0.2)
    const player = createAudioPlayer()
    song_queue.connection.subscribe(player)
    player.play(resource)
    player.on('stateChange', async (_, newState) => {
        if (newState.status == 'idle') {
            song_queue.songs.shift()
            video_player(guild, song_queue.songs[0])
        }
    })
    song_queue.player = player
    await song_queue.text_channel.send(`🎶 Now playing **${song.title}**`)
}

const skip_player = (message: Message, server_queue: any) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!')
    if (!server_queue || server_queue.songs.length == 1) return message.channel.send(`There are no songs in queue 😔`)
    server_queue.player.stop()
}

const stop_song = (message: Message, server_queue: any) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!')
    if (!server_queue) return message.channel.send(`There are no songs in channel 😔`)
    server_queue.songs = []
    message.channel.send('Stopping music, leave from voice channel...')
    setTimeout(() => server_queue.connection.destroy(), 1000)
}
