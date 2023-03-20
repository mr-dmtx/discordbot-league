const config = require('../config.json');
const { SlashCommands, SlashCommandBuilder } = require('discord.js');
const { useMasterPlayer } = require("discord-player");


module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pular a música que esta tocando'),
  async execute(interaction) {

    try {

      const voiceChannel = interaction.guild.members.cache.get(interaction.member.user.id).voice.channel;

      if (!voiceChannel) return (await interaction.reply("Entre em um canal de voz!"));

      await interaction.deferReply({ ephemeral: true });
      const player = useMasterPlayer();

      const queue = player.nodes.get(interaction.guildId);

      if (queue.isEmpty()) return interaction.followUp("Fila de músicas vázia...");

      queue.node.queue.node.skip();

      return interaction.followUp("Pulando essa música...");
    } catch (erro) {
      console.log(erro);
      return interaction.followUp('Ocorreu um erro! Tente novamente!');
    }
  },

};