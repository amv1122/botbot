const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('baileys');
const qrcode = require('qrcode-terminal');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');

// බොට් සැකසුම් (Settings)
const BOT_NAME = "Amv Wp Bot";
const OWNER_NUMBER = "94762747388"; // ඔබේ අංකය
let voiceMode = true; // Voice Mode එක On/Off කිරීමට

async function startAmvBot() {
    // Session එක save කරගැනීමට folder එකක් සෑදීම
    const { state, saveCreds } = await useMultiFileAuthState('amv_auth_session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Terminal එකේ QR Code එක පෙන්වීමට
        logger: pino({ level: 'silent' }),
        browser: [BOT_NAME, 'Safari', '3.0']
    });

    sock.ev.on('creds.update', saveCreds);

    // Connection එක ගැන බැලීමට
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom) 
                ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut 
                : true;
            
            console.log(`සම්බන්ධතාවය බිඳ වැටුණි. නැවත සම්බන්ධ වෙමින්: ${shouldReconnect}`);
            if (shouldReconnect) {
                startAmvBot();
            }
        } else if (connection === 'open') {
            console.log(`\n===================================`);
            console.log(`🎉 ${BOT_NAME} සාර්ථකව සම්බන්ධ විය! (ONLINE)`);
            console.log(`===================================\n`);
        }
    });

    // Messages සහ Commands හසුරුවන කොටස
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        
        // මැසේජ් එක Text එකක්දැයි බැලීම
        const messageType = Object.keys(msg.message)[0];
        let body = "";
        if (messageType === 'conversation') body = msg.message.conversation;
        else if (messageType === 'extendedTextMessage') body = msg.message.extendedTextMessage.text;

        const cleanBody = body.trim().toLowerCase();
        const prefix = "."; // Command පටන් ගන්නා ලකුණ

        // Reply යවන Function එක (Voice Mode එක On නම් "Recording..." ලෙස පෙන්වයි)
        async function reply(text) {
            if (voiceMode) {
                await sock.sendPresenceUpdate('recording', sender); // Recording status එක පෙන්වීමට
                await sock.sendMessage(sender, { text: `[🎙️ Voice Mode Active]\n\n${text}` }, { quoted: msg });
            } else {
                await sock.sendMessage(sender, { text: text }, { quoted: msg });
            }
        }

        // Commands ලැයිස්තුව
        if (cleanBody.startsWith(prefix)) {
            const args = cleanBody.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            switch (command) {
                case 'menu':
                case 'help':
                    const menuText = `🤖 *Welcome to ${BOT_NAME}* 🤖\n\n` +
                                     `*Commands ලැයිස්තුව:*\n` +
                                     `👉 \`.menu\` - Commands සියල්ල බැලීමට\n` +
                                     `👉 \`.ping\` - බොට් වැඩදැයි බැලීමට\n` +
                                     `👉 \`.status\` - බොට්ගේ තත්වය බැලීමට\n` +
                                     `👉 \`.voicemode on\` - Voice Mode සක්‍රීය කිරීමට\n` +
                                     `👉 \`.voicemode off\` - Voice Mode අක්‍රීය කිරීමට\n\n` +
                                     `_වත්මන් Voice Mode තත්වය: ${voiceMode ? "🟢 ON" : "🔴 OFF"}_`;
                    await reply(menuText);
                    break;

                case 'ping':
                    await reply("🏓 Pong! Amv Wp Bot සක්‍රීයව පවතී.");
                    break;

                case 'status':
                    await reply(`📊 *Bot Status:*\n• Name: ${BOT_NAME}\n• System: Linux VPS\n• Node Environment: Connected`);
                    break;

                case 'voicemode':
                    if (args[0] === 'on') {
                        voiceMode = true;
                        await sock.sendMessage(sender, { text: "🟢 Voice Reply Mode එක සක්‍රීය කරන ලදී!" }, { quoted: msg });
                    } else if (args[0] === 'off') {
                        voiceMode = false;
                        await sock.sendMessage(sender, { text: "🔴 Voice Reply Mode එක අක්‍රීය කරන ලදී. (Text පමණි)" }, { quoted: msg });
                    } else {
                        await reply("💡 කරුණාකර `.voicemode on` හෝ `.voicemode off` ලෙස භාවිතා කරන්න.");
                    }
                    break;

                default:
                    await reply("❓ නොදන්නා Command එකක්. සියලුම Commands බැලීමට `.menu` ලෙස Type කරන්න.");
                    break;
            }
        }
    });
}

startAmvBot();
