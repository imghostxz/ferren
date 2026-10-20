// Reads Ferren's Discord profile picture through the official Discord API and writes data/avatar.json.
// Runs on GitHub Actions every 30 minutes (.github/workflows/discord-avatar.yml). The bot token lives only in the
// repository's encrypted secrets; the browser reads the public JSON and never sees the token.
// Local run: DISCORD_BOT_TOKEN=... node scripts/update-avatar.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const USER_ID = '1098242796919476264'; // Ferren's account (username m0rrign). The id never changes; usernames can.
const OUT = new URL('../data/avatar.json', import.meta.url);
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('DISCORD_BOT_TOKEN is not set');
  process.exit(1);
}

const res = await fetch(`https://discord.com/api/v10/users/${USER_ID}`, {
  headers: { Authorization: `Bot ${token}`, 'User-Agent': 'DiscordBot (ferren-links, 1.0)' },
  signal: AbortSignal.timeout(20000),
});
if (!res.ok) {
  console.error(`Discord answered ${res.status}`);
  process.exit(1);
}
const user = await res.json();
const hash = user.avatar; // null while she uses Discord's default picture
const animated = Boolean(hash && hash.startsWith('a_'));
const url = hash ? `https://cdn.discordapp.com/avatars/${USER_ID}/${hash}.${animated ? 'gif' : 'png'}?size=512` : null;

// only publish a picture that really loads
if (url) {
  const check = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
  if (!check.ok) {
    console.error(`the new picture does not load (${check.status}), keeping the old one`);
    process.exit(1);
  }
}

let old = {};
try { old = JSON.parse(await readFile(OUT, 'utf8')); } catch { /* first run */ }
const month = new Date().toISOString().slice(0, 7);
// writes when the picture changed, and once a month anyway so GitHub keeps the schedule alive
if (old.hash === hash && old.checked === month) {
  console.log('unchanged');
  process.exit(0);
}
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
const data = { id: USER_ID, hash, url, animated, changed: old.hash === hash ? old.changed : new Date().toISOString(), checked: month };
await writeFile(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(old.hash === hash ? 'monthly check written' : `picture updated: ${hash}`);
