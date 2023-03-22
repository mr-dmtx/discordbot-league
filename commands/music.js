const config = require('../config.json');
const { SlashCommands, SlashCommandBuilder } = require('discord.js');
const { useMasterPlayer, QueryType } = require("discord-player");


module.exports = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('Tocar música em um canal de voz')
    .addStringOption(option => option.setName("procurar").setDescription("Nome da música")),
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true});

      const voiceChannel = interaction.guild.members.cache.get(interaction.member.user.id).voice.channel;

      if (!voiceChannel) return (await interaction.editReply({content: "Entre em um canal de voz!", ephemeral: true}));
      
      const player = useMasterPlayer();
      //procurar musica
      const termSearch = interaction.options.getString('procurar');
      const searchResult = await player.search(termSearch, { requestedBy: interaction.user, searchEngine: QueryType.AUTO });

      if (!searchResult.hasTracks()) return interaction.followUp('Música não encontrada');

      const { track } = await player.play(voiceChannel, searchResult, {
        metadata: interaction
      });
      
      return interaction.followUp({content: `**${track.title}** na fila!`, ephemeral: false});
    } catch (erro) {
      console.log(erro);
      return interaction.followUp('Ocorreu um erro! Tente novamente!');
    }
  },

};