const config = require('../config.json');
let LeagueAPI = require('leagueapiwrapper');
const { AttachmentBuilder, SlashCommands, SlashCommandBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');
LeagueAPI = new LeagueAPI(config.leagueAPIKey, Region.BR1);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('elo')
    .setDescription('Elo do jogador')
    .addStringOption(option => option.setName("nickname").setDescription("Nick do jogador")),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      //PLANO DE FUNDO
      const canvas = Canvas.createCanvas(500, 280);
      const context = canvas.getContext('2d');
      const background = await readFile('./assets/wp.png');
      const backgroundImage = new Canvas.Image();
      backgroundImage.src = background;
      context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    
      const summonerName = interaction.options.getString('nickname');
      const summoner = await LeagueAPI.getSummonerByName(summonerName, 'br1');
      const rankingSummoner = await LeagueAPI.getLeagueRanking(summoner);

      //TEXTO NOME JOGADOR
      context.font = applyText(canvas, summoner.name);
      context.fillStyle = 'white';
      context.textAlign = "center";
      context.fillText(summoner.name, canvas.width / 2, canvas.height / 5);
      
      if (rankingSummoner.length > 0) {
        for (var i in rankingSummoner) {
          if (rankingSummoner[i].queueType != "RANKED_TFT_DOUBLE_UP") {
            //INFO DA FILA
            const emblem = await readFile(`./assets/${rankingSummoner[i].tier.toLowerCase()}.png`);
            const emblemImage = new Canvas.Image();
            emblemImage.src = emblem;
            context.drawImage(emblemImage, canvas.width / 30, canvas.height / (4.2-(i*2.4)), 65, 83);

            context.font = applyText(canvas,`${rankingSummoner[i].tier} ${rankingSummoner[i].rank} ${rankingSummoner[i].leaguePoints}PDL ${Math.trunc((rankingSummoner[i].wins * 100) / (rankingSummoner[i].losses + rankingSummoner[i].wins))}% - ${(rankingSummoner[i].queueType === "RANKED_SOLO_5x5" ? " SOLOQ " : " FLEX ")}`);
            context.fillStyle = 'white';
            context.textAlign = "left";
            context.fillText(`${rankingSummoner[i].tier} ${rankingSummoner[i].rank} ${rankingSummoner[i].leaguePoints}PDL ${Math.trunc((rankingSummoner[i].wins * 100) / (rankingSummoner[i].losses + rankingSummoner[i].wins))}% - ${(rankingSummoner[i].queueType === "RANKED_SOLO_5x5" ? " SOLOQ " : " FLEX ")}`, canvas.width / 5.5, canvas.height / (2.3-(i*1.01)));
          }
          else {
            context.font = applyText(canvas,`${summoner.summonerLevel} Lvl.`);
            context.fillStyle = 'white';
            context.textAlign = "center";
            context.fillText(`${summoner.summonerLevel} Lvl. UNRANKED`, canvas.width / 2, canvas.height / 2);
          }
        }
      }
      else {
        context.font = applyText(canvas,`${summoner.summonerLevel} Lvl.`);
        context.fillStyle = 'white';
        context.textAlign = "center";
        context.fillText(`${summoner.summonerLevel} Lvl. UNRANKED`, canvas.width / 2, canvas.height / 2);
      }
      const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'elo.png' });
      interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.log(error);
      interaction.editReply("Ocorreu um erro ao executar o comando!");
    }
  },
};

const applyText = (canvas, text) => {
  const context = canvas.getContext('2d');

  // Declare a base size of the font
  let fontSize = 65;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    context.font = `${fontSize -= 1}px Bebas Neue`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (context.measureText(text).width > canvas.width - 100);

  // Return the result to use in the actual canvas
  return context.font;
};