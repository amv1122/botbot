module.exports = {
  name: 'help',
  aliases: ['menu'],
  description: 'List all available commands.',
  async execute({ sock, jid, botName, prefix, commands }) {
    // commands is a Map that includes alias entries pointing at the same
    // command object — dedupe by the canonical .name before printing.
    const unique = new Map();
    for (const cmd of commands.values()) {
      unique.set(cmd.name, cmd);
    }

    const lines = [`📋 *${botName} — Command List*`, ''];
    for (const cmd of unique.values()) {
      lines.push(`*${prefix}${cmd.name}* — ${cmd.description}`);
    }

    await sock.sendMessage(jid, { text: lines.join('\n') });
  },
};
