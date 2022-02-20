const fs = require('fs');

require('dotenv').config();

const {Client, Intents, Collection} = require('discord.js');
const music = require('@koenie06/discord.js-music');

const keepAlive = require('./server');

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});

let botPlaying = false;

client.slashcommands = new Collection();
const slashCommandFiles = fs.readdirSync('./slash_commands').filter(file => file.endsWith('.js'));

for(const file of slashCommandFiles)
{
    const slash = require(`./slash_commands/${file}`);
    client.slashcommands.set(slash.data.name, slash);
}

client.on('ready', () =>
{
    console.log(client.user.tag);
});

client.on('interactionCreate', async(interaction) =>
{
    if(interaction.isCommand())
    {
        const slashcmds = client.slashcommands.get(interaction.commandName);

        if(!slashcmds) return;

        try 
        {
            await slashcmds.run(client, interaction, botPlaying);
        } 
        catch (error) 
        {
            console.log(error);
        }
    }

    if(interaction.isButton())
    {
        if(botPlaying)
        {
            if(interaction.customId == 'pause')
            {
                if(await music.isPaused({interaction}))
                {
                    music.resume({interaction});
                    interaction.reply('Song resumed');
                }
                else
                {
                    music.pause({interaction});
                    interaction.reply('Song paused');
                }
            }

            if(interaction.customId == 'skip')
            {
                music.skip({interaction});
                interaction.reply('Song skipped');
            }

            if(interaction.customId == 'queue')
            {
                const queue = await music.getQueue({interaction});
                
                let str = '_**Queue**_\n';
                queue.forEach((elm, i) => 
                {
                    str += `${i + 1}) Song name: **${elm.info.title}** Added by: <@!${elm.requester.id}>\n`
                });

                interaction.reply(str);
            }
        }
        else
        {
            interaction.reply('Nothing to skip');
        }
    }
});

music.event.on('finish', () =>
{
    botPlaying = false;
});

music.event.on('playSong', (channel) =>
{
    botPlaying = true;
});

if(process.env.PRODUCTION == 1)
{
    keepAlive();
}

client.login(process.env.TOKEN);