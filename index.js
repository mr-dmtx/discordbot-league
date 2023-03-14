const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
let LeagueAPI = require('leagueapiwrapper');

const client = new Client({
  intents: [GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

LeagueAPI = new LeagueAPI(config.leagueAPIKey, Region.BR1);

//DISCORD API

client.on('ready', () => {
  console.log("pai ta on!");
});

client.on('messageCreate', async message => {
  if (message.author.bot || message.author.system) return;

  if (message.content.toLowerCase().startsWith("!elo")) {
    const nickName = message.content.split("!elo");
    try {
      const summoner = await LeagueAPI.getSummonerByName(nickName[1], 'br1');
      const rankingSummoner = await LeagueAPI.getLeagueRanking(summoner);
      
      var msgResposta = "";
      if (rankingSummoner.length > 0) {
        for (var i in rankingSummoner) {
          msgResposta += summoner.name + " - "
            + rankingSummoner[i].tier + " "
            + rankingSummoner[i].rank + " "
            + rankingSummoner[i].leaguePoints + "PDL" + (rankingSummoner[i].queueType === "RANKED_SOLO_5x5" ? " SOLO/DUO " : " FLEX ")
            + Math.trunc((rankingSummoner[i].wins * 100) / (rankingSummoner[i].losses + rankingSummoner[i].wins)) + "% VIT. "
            + (rankingSummoner[i].wins + rankingSummoner[i].losses) + " PARTIDAS";
          msgResposta += rankingSummoner.length > 1 ? " \n" : "";
        }
      }
      else {
        msgResposta = summoner.name + " - Lvl." + summoner.summonerLevel + " UNRANKED";
      }
    } catch (e) {
      console.log(e);
      msgResposta = "Jogador não encontrado!";
    };
    message.reply(msgResposta);
  }
});

client.login(config.discordBotToken);

//LEAGUE OF LEGENDS API
