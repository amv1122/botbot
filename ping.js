module.exports = {
  name: 'ping',
  description: 'Check if the bot is online and measure response speed.',
  async execute({ sock, jid, prefix }) {
    const start = Date.now();
    await sock.sendMessage(jid, { text: '🏓 Pinging...' });
    const elapsed = Date.now() - start;
    await sock.sendMessage(jid, { text: `🏓 Pong! Response time: ${elapsed}ms` });
  },
};
