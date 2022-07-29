const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const clientId = process.env.clientId
const guildId = process.env.guildId
const discordToken = process.env.token

const commands = [
	new SlashCommandBuilder().setName('records').setDescription('Replies with records of the map !')
	.addStringOption(option =>
		option.setName('map-uid')
			.setDescription('The id of the map')
			.setRequired(true))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(discordToken);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
