# Amv Wp Bot

A WhatsApp bot built on [Baileys](https://github.com/WhiskeySockets/Baileys) (Node.js, no Chromium/Puppeteer — connects directly over WebSocket). Links via **pairing code**, not QR scan.

This build ships with **general commands only**, on purpose:

| Command | Aliases | What it does |
|---|---|---|
| `.ping` | | Reports response latency |
| `.alive` | | Confirms the bot is up |
| `.uptime` | | Reports how long the process has been running |
| `.help` | `.menu` | Lists all available commands |
| `.info` | | Shows basic info about the bot |
| `.owner` | | Shows the configured owner's number |
| `.time` | | Shows the current date/time *on the VPS* |

No admin, group-management, media, or download commands are included. To add more, drop a new file in `commands/` following the same shape as the existing ones — `commandLoader.js` picks it up automatically on the next restart, no other code changes needed.

---

## 1. Get a VPS and connect to it

Any small Ubuntu 22.04/24.04 VPS works (1 vCPU / 1GB RAM is enough — Baileys is lightweight). Connect via SSH:

```bash
ssh root@your-vps-ip
```

## 2. Install Node.js 20+

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # should print v20.x or higher
```

## 3. Upload the bot files

From your own computer (not the VPS), upload the whole `amv-wp-bot` folder — **except** `node_modules`, since you'll reinstall that fresh on the VPS to match its architecture:

```bash
# Run this from your local machine, in the folder containing amv-wp-bot/
scp -r amv-wp-bot root@your-vps-ip:/root/
```

Or, if you put the project on GitHub first (recommended — see the `.gitignore` already included, which keeps your `.env` and session folder out of the repo):

```bash
# On the VPS
git clone <your-repo-url> amv-wp-bot
```

## 4. Install dependencies on the VPS

```bash
cd amv-wp-bot
npm install
```

## 5. Confirm your `.env`

The `.env` file is already set up with your number:

```
PHONE_NUMBER=94762747388
PREFIX=.
BOT_NAME=Amv Wp Bot
OWNER_NUMBER=94762747388
```

`PHONE_NUMBER` is the number the bot will link to — no `+`, no spaces, no dashes, just the digits with country code (94 = Sri Lanka, then the rest of the number).

## 6. First run — link with the pairing code

```bash
node index.js
```

Within a few seconds you'll see something like:

```
========================================
 Pairing code for +94762747388:
   ABCD-1234
 On your phone: WhatsApp → Settings →
 Linked Devices → Link a Device →
 "Link with phone number instead" → enter this code.
========================================
```

On the phone that owns **+94762747388**:

1. Open WhatsApp
2. **Settings → Linked Devices → Link a Device**
3. Tap **"Link with phone number instead"** (small text link, usually below the QR scanner)
4. Type in the 8-character code shown in your terminal

Once linked, the terminal will print `✅ Amv Wp Bot connected to WhatsApp.` and the bot is live. Send `.ping` from any chat to confirm.

A folder called `auth_info/` gets created the first time you link — **this folder is your session**. Keep the bot running with the same `auth_info/` folder and you won't need to re-pair. If you delete it, you'll need to repeat the pairing step.

> **Don't share `auth_info/` with anyone or upload it anywhere public.** It's a working login to that WhatsApp number — equivalent to someone having your unlocked phone's WhatsApp open. Treat it like a password.

Press `Ctrl+C` once you've confirmed it connects — you'll run it properly in the background next.

## 7. Keep it running permanently with pm2

Running `node index.js` directly stops the moment you close your SSH session. `pm2` keeps it running in the background and restarts it automatically if it crashes or the VPS reboots.

```bash
sudo npm install -g pm2

# Start the bot under pm2
npm run pm2:start

# Make pm2 itself start on VPS boot
pm2 startup
pm2 save
```

Useful commands afterward:

```bash
npm run pm2:logs      # tail live logs
npm run pm2:restart   # restart the bot
npm run pm2:stop      # stop it
pm2 list              # see all pm2-managed processes
```

## Re-linking later / switching numbers

If you ever need to unlink and re-pair (e.g. moving to a different number), stop the bot, delete the session folder, and start again:

```bash
npm run pm2:stop
rm -rf auth_info
npm run pm2:start
npm run pm2:logs   # watch here for the new pairing code
```

## Adding more general commands later

Create a new file in `commands/`, e.g. `commands/joke.js`:

```js
module.exports = {
  name: 'joke',
  description: 'Tell a joke.',
  async execute({ sock, jid }) {
    await sock.sendMessage(jid, { text: 'Why did the chicken cross the road? ...' });
  },
};
```

Restart the bot (`npm run pm2:restart`) and `.joke` is live — `.help`/`.menu` will list it automatically.
