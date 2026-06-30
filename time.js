module.exports = {
  name: 'time',
  description: 'Show the current date and time on the server.',
  // Note: this uses the VPS's own system timezone, which may differ from
  // the timezone of the linked WhatsApp number. Set the VPS timezone with
  // `sudo timedatectl set-timezone Asia/Colombo` if you want it to match
  // Sri Lanka time specifically.
  async execute({ sock, jid }) {
    const now = new Date();
    const formatted = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    await sock.sendMessage(jid, { text: `🕒 Current server time:\n${formatted}` });
  },
};
