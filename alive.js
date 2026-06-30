module.exports = {
  name: 'alive',
  description: 'Check that the bot is up and running.',
  async execute({ sock, jid, botName }) {
    await sock.sendMessage(jid, {
      text: `✅ ${botName} is alive and running.`,
    });
  },
};
