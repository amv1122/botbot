'use strict';

function formatDuration(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

module.exports = {
  name: 'uptime',
  description: 'Show how long the bot process has been running since it last started.',
  async execute({ sock, jid, botName }) {
    const uptime = formatDuration(process.uptime());
    await sock.sendMessage(jid, {
      text: `⏱️ *${botName}* has been running for: ${uptime}`,
    });
  },
};
