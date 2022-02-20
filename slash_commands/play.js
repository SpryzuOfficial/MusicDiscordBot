const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const yts = require('youtube-search-without-api-key');

const music = require('@koenie06/discord.js-music');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('play music')
        .addStringOption(option => option.setName('name').setDescription('Music name').setRequired(true)),

    async run(client, interaction, botPlaying)
    {
        const name = interaction.options.getString('name');
        const videos = await yts.search(name);

        music.play({
            interaction: interaction,
            channel: interaction.member.voice.channel,
            song: videos[0].url
        });

        try
        {
            if(botPlaying)
            {
                interaction.reply(`**${videos[0].title}** Added to queue`);
            }
            else
            {
                const embed = new MessageEmbed()
                        .setColor('#FF0000')
                        .setAuthor({name: client.user.username})
                        .setTitle(`Dj controlls`)
                        .setTimestamp();

                const row = new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('pause')
                                    .setLabel('⏸/▶️')
                                    .setStyle('PRIMARY'),
                            )
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('skip')
                                    .setLabel('⏭')
                                    .setStyle('PRIMARY'),
                            )
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('queue')
                                    .setLabel('Queue')
                                    .setStyle('PRIMARY'),
                            );  

                interaction.reply({embeds: [embed], components: [row]});
            }
        }
        catch(error)
        {
            console.log(error);
        }
    }
}