module.exports = {
  name: 'info',
  description: 'Show information about this bot.',
  async execute({ sock, jid, botName, prefix }) {
    const text = [
      `🤖 *${botName}*`,
      '',
      'A WhatsApp bot built with Baileys (Node.js).',
      `Type ${prefix}help to see all available commands.`,
    ].join('\n');
    await sock.sendMessage(jid, { text });
  },
};
