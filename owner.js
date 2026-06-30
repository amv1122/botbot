module.exports = {
  name: 'owner',
  description: "Show the bot owner's contact number.",
  async execute({ sock, jid, ownerNumber, botName }) {
    if (!ownerNumber) {
      await sock.sendMessage(jid, { text: '⚠️ No owner number has been configured.' });
      return;
    }
    await sock.sendMessage(jid, {
      text: `👤 ${botName} Owner\n📞 +${ownerNumber}`,
    });
  },
};
