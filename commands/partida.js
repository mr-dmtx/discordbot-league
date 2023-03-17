const fetch = require('node-fetch');
const config = require('../config.json');
let LeagueAPI = require('leagueapiwrapper');
const { SlashCommands, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

LeagueAPI = new LeagueAPI(config.leagueAPIKey, Region.BR1);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partida')
    .setDescription('Exibe os jogadores e seus champions que estão na mesma partida ao vivo')
    .addStringOption(option => option.setName("nickname").setDescription("Nick do jogador que esta na partida")),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      //OBTEM A PARTIDA AO VIVO
      const summonerName = interaction.options.getString('nickname');
      const summoner = await LeagueAPI.getSummonerByName(summonerName, 'br1');
      const activeGame = await LeagueAPI.getActiveGames(summoner);

      //LER O ARQUIVO JSON COM A INFORMACAO DOS CAMPEOES
      const championsObj = await fetch(config.championsLol)
        .then(response => response.json())
        .then(data => { return data.data });

      //CRIACAO DO EMBED. 
      //OBTER OS JOGADORES DA PARTIDA 
      let teamBlue = [];
      let teamRed = [];
      for (const i in activeGame.participants) {
        //OBTER O CHAMP QUE ESTA JOGANDO
        let champName = "";
        Object.keys(championsObj).forEach(key => {
          const ckey = championsObj[key].key;
          if (ckey == activeGame.participants[i].championId.toString()) {
            champName = championsObj[key].name;
          }
        });
        //OBTER O ELO DA FILA SOLO/DUO DE CADA JOGADOR
        const summoner = await LeagueAPI.getSummonerByName(activeGame.participants[i].summonerName, 'br1');
        const rankingSummoner = await LeagueAPI.getLeagueRanking(summoner);
        let rankSummoner = "";
        if (rankingSummoner.length > 0) {
          for (var r in rankingSummoner) {
            if (rankingSummoner[r].queueType != "RANKED_TFT_DOUBLE_UP") {
              rankSummoner +=
                rankingSummoner[r].tier + " "
                + rankingSummoner[r].rank + " "
                + (rankingSummoner[r].queueType == "RANKED_FLEX_SR" ? "[Flex]\n" : "\n");
            }
            else{
              rankSummoner = "\n";
            }
          }
        }
        else {
          rankSummoner = "UNRANKED \n";
        }

        //VER LADO DO JOGADOR
        if (activeGame.participants[i].teamId == 100) {
          teamBlue.push({
            name: activeGame.participants[i].summonerName + " (" + champName + ")",
            value: rankSummoner,
            inline: true
          });
        }
        else {
          teamRed.push({
            name: activeGame.participants[i].summonerName + " (" + champName + ")",
            value: rankSummoner,
            inline: true
          });
        }
      }

      //CRIA O EMBED
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("Partida " + "["+activeGame.gameMode+"]" + " ao vivo do " + summoner.name);
      embed.addFields(teamBlue);
      embed.addFields({ name: '-----------------------------------------------------------------------------------', 
                        value: '-----------------------------------------------------------------------------------' });
      embed.addFields(teamRed);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.log(error);
      if (error.status.status_code == 404) {
        await interaction.editReply("Jogador não encontrado!");
      }

    }
  },
};