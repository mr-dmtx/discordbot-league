const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection, GuildMember  } = require('discord.js');
const config = require('./config.json');
const { Player } = require("discord-player")

const client = new Client({
  intents: [GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

//DISCOR

//player
var player = new Player(client, { ytdlOptions: { quality: 'highestaudio' } });

client.once(Events.ClientReady, () => {
  console.log("pai ta on!");
});

client.on(Events.InteractionCreate, async interaction => {

  if(!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if(!command) return;

  try{

      await command.execute(interaction);

  } catch(err) {
    console.log(err);
    if(interaction.replied || interaction.deferred){
      await interaction.editReply({content: 'Chama o admin! Tente novamente!', ephemeral: true});
    }
    else{
      await interaction.editReply({content: 'Chama o admin! Tente novamente!', ephemeral: true});
    }
  }

});

client.login(config.discordBotToken);