/*
Bot Node.js atualizado com Slash Command /polaco
Mantém status, heartbeat e servidor Express
*/

const { Client, GatewayIntentBits, ActivityType, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');

// ---------- CONFIGURAÇÃO DO CLIENT ----------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ],
});

// ---------- SERVIDOR EXPRESS ----------
const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});
app.listen(port, () => {
  console.log('\x1b[36m[ SERVER ]\x1b[0m', '\x1b[32m SH : http://localhost:' + port + ' ✅\x1b[0m');
});

// ---------- STATUS ----------
const statusMessages = ["Playing Battlefield 6 🔥"];
const statusTypes = ['dnd'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

function updateStatus() {
  const currentStatus = statusMessages[currentStatusIndex];
  const currentType = statusTypes[currentTypeIndex];
  client.user.setPresence({
    activities: [{ name: currentStatus, type: ActivityType.Custom }],
    status: currentType,
  });
  console.log('\x1b[33m[ STATUS ]\x1b[0m', `Updated status to: ${currentStatus} (${currentType})`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
  currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

// ---------- HEARTBEAT ----------
function heartbeat() {
  setInterval(() => {
    console.log('\x1b[35m[ HEARTBEAT ]\x1b[0m', `Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

// ---------- SLASH COMMANDS ----------
const commands = [
  new SlashCommandBuilder()
    .setName('polaco')
    .setDescription('Verifica se o Polaco Guardian está ativo!')
]
  .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function registerCommands() {
  try {
    console.log('\x1b[36m[ SLASH ]\x1b[0m', 'Registrando comandos no servidor...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1300277156621975632'),
      { body: commands }
    );
    console.log('\x1b[32m[ SLASH ]\x1b[0m Comando /polaco registrado ✅');
  } catch (error) {
    console.error('\x1b[31m[ SLASH ERROR ]\x1b[0m', error);
  }
}

// ---------- EVENTOS ----------
client.once('ready', () => {
  console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mPing: ${client.ws.ping} ms \x1b[0m`);
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
  registerCommands();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'polaco') {
    await interaction.reply('Polaco Guardian está ativo! ✅');
  }
});

// ---------- LOGIN ----------
async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log('\x1b[36m[ LOGIN ]\x1b[0m', `\x1b[32mLogged in as: ${client.user.tag} ✅\x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[35mBot ID: ${client.user.id} \x1b[0m`);
    console.log('\x1b[36m[ INFO ]\x1b[0m', `\x1b[34mConnected to ${client.guilds.cache.size} server(s) \x1b[0m`);
  } catch (error) {
    console.error('\x1b[31m[ ERROR ]\x1b[0m', 'Failed to log in:', error);
    process.exit(1);
  }
}

login();
