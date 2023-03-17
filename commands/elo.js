const config = require('../config.json');
let LeagueAPI = require('leagueapiwrapper');
const {SlashCommands, SlashCommandBuilder} = require('discord.js');

LeagueAPI = new LeagueAPI(config.leagueAPIKey, Region.BR1);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('elo')
    .setDescription('Elo do jogador')
    .addStringOption(option => option.setName("nickname").setDescription("Nick do jogador")),
  async execute(interaction){
    var msgResposta = "";
    const summonerName = interaction.options.getString('nickname');
    const summoner = await LeagueAPI.getSummonerByName(summonerName, 'br1');
    const rankingSummoner = await LeagueAPI.getLeagueRanking(summoner);
    console.log(rankingSummoner);
    if (rankingSummoner.length > 0) {
      for (var i in rankingSummoner) {
        if(rankingSummoner[i].queueType != "RANKED_TFT_DOUBLE_UP"){
          msgResposta += summoner.name + " - "
          + rankingSummoner[i].tier + " "
          + rankingSummoner[i].rank + " "
          + rankingSummoner[i].leaguePoints + "PDL" + (rankingSummoner[i].queueType === "RANKED_SOLO_5x5" ? " SOLO/DUO " : " FLEX ")
          + Math.trunc((rankingSummoner[i].wins * 100) / (rankingSummoner[i].losses + rankingSummoner[i].wins)) + "% VIT. "
          + (rankingSummoner[i].wins + rankingSummoner[i].losses) + " PARTIDAS";
        msgResposta += rankingSummoner.length > 1 ? " \n" : "";
        }
        else{
          msgResposta = "\n";
        }
      }
    }
    else {
      msgResposta = summoner.name + " - Lvl." + summoner.summonerLevel + " UNRANKED";
    }

      await interaction.reply(msgResposta);
    },
};