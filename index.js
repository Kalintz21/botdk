/*
Bot Node.js completo com Slash Commands, auto-resposta e cleanmakki automático
Mantém status + heartbeat + Express
*/

const { Client, GatewayIntentBits, ActivityType, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
require('dotenv').config();
const express = require('express');
const path = require('path');

// ---------- CONFIGURAÇÃO DO CLIENT ----------
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
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
  console.log('[SERVER] SH : http://localhost:' + port + ' ✅');
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
  console.log(`[STATUS] Updated status to: ${currentStatus} (${currentType})`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
  currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

// ---------- HEARTBEAT ----------
function heartbeat() {
  setInterval(() => {
    console.log(`[HEARTBEAT] Bot is alive at ${new Date().toLocaleTimeString()}`);
  }, 30000);
}

// ---------- SLASH COMMANDS ----------
const commands = [
  new SlashCommandBuilder().setName('polaco').setDescription('Polaco Guardian está ativo! ✅'),
  new SlashCommandBuilder().setName('dk').setDescription('Mostra informações do servidor'),
  new SlashCommandBuilder().setName('avatar').setDescription('Mostra avatar de um usuário').addUserOption(option => option.setName('usuario').setDescription('Usuário para mostrar o avatar')),
  new SlashCommandBuilder().setName('falar').setDescription('Bot repete a mensagem').addStringOption(option => option.setName('mensagem').setDescription('Mensagem a enviar').setRequired(true)),
  new SlashCommandBuilder().setName('guardian').setDescription('Conecta o bot em um canal de voz'),
]
  .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function registerCommands() {
  try {
    console.log('[SLASH] Registrando comandos no servidor...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1300277156621975632'),
      { body: commands }
    );
    console.log('[SLASH] Comandos registrados ✅');
  } catch (error) {
    console.error('[SLASH ERROR]', error);
  }
}

// ---------- EVENTOS ----------
client.once('ready', () => {
  console.log(`[INFO] Ping: ${client.ws.ping} ms`);
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
  registerCommands();
});

// ---------- INTERAÇÕES DE SLASH COMMAND ----------
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'polaco') {
    await interaction.reply('Polaco Guardian está ativo! ✅');
  }

  else if (commandName === 'dk') {
    const guild = interaction.guild;
    await interaction.reply(`🏰 Servidor: ${guild.name}\nID: ${guild.id}\nMembros: ${guild.memberCount}\nCriado em: ${guild.createdAt.toLocaleDateString()}`);
  }

  else if (commandName === 'avatar') {
    const user = interaction.options.getUser('usuario') || interaction.user;
    await interaction.reply({ content: `${user.tag}`, files: [user.displayAvatarURL({ dynamic: true, size: 1024 })] });
  }

  else if (commandName === 'falar') {
    const mensagem = interaction.options.getString('mensagem');
    await interaction.reply(`🗣️ Polaco diz: ${mensagem}`);
  }

  else if (commandName === 'guardian') {
    // Conecta no canal de voz que o usuário está
    const member = interaction.member;
    if (!member.voice.channel) {
      await interaction.reply('Você precisa estar em um canal de voz para que eu possa conectar!');
      return;
    }
    joinVoiceChannel({
      channelId: member.voice.channel.id,
      guildId: member.guild.id,
      adapterCreator: member.guild.voiceAdapterCreator,
    });
    await interaction.reply(`✅ Conectado ao canal de voz: ${member.voice.channel.name}`);
  }
});

// ---------- AUTO-RESPOSTA PARA MENÇÃO DO DEV ----------
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Auto-resposta quando mencionam seu ID
  const devID = '711382505558638612';
  if (message.mentions.users.has(devID)) {
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Olá!')
      .setDescription(`Olá, vejo que você citou o nome do meu desenvolvedor, se precisar de ajuda vá ao canal de <#1300277158819795013>`)
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `Mensagem enviada automaticamente` });

    const sentMsg = await message.channel.send({ content: `<@${message.author.id}>`, embeds: [embed] });
    setTimeout(() => sentMsg.delete().catch(() => {}), 5 * 60 * 1000); // Deleta após 5 min
  }

  // ---------- CLEANMAKKI AUTOMÁTICO ----------
  const makkiContent = 'Vocês gostam da nossa comunidade?';
  if (message.author.bot && message.content.includes(makkiContent)) {
    setTimeout(() => message.delete().catch(() => {}), 10000); // Deleta após 10s
  }
});

// ---------- LOGIN ----------
async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log(`Logged in as: ${client.user.tag} ✅`);
    console.log(`Bot ID: ${client.user.id}`);
    console.log(`Connected to ${client.guilds.cache.size} server(s)`);
  } catch (error) {
    console.error('Failed to log in:', error);
    process.exit(1);
  }
}

login();
