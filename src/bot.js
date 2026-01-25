require("dotenv").config();
const { Telegraf } = require("telegraf");

const startCommand = require("./commands/start");
const adminCommand = require("./commands/admin");
const { getMoviesFromSheet } = require("./services/googleSheet");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Temporary logging for chat IDs (remove after getting private group ID)
bot.on('message', async (ctx) => {
  if ((ctx.chat.type === 'group' || ctx.chat.type === 'supergroup' || ctx.chat.type === 'channel') && ctx.from.id.toString() === process.env.ADMIN_ID) {
    // Send chat ID to admin
    await ctx.reply(`Chat Info:\nID: ${ctx.chat.id}\nTitle: ${ctx.chat.title}\nType: ${ctx.chat.type}\nUsername: ${ctx.chat.username || 'None (private)'}`);
    console.log(`Chat ID: ${ctx.chat.id}, Title: ${ctx.chat.title}, Type: ${ctx.chat.type}, Username: ${ctx.chat.username}`);
  }
});

/* =========================
   USER COMMANDS
   ========================= */
bot.command("start", startCommand);

bot.command("help", (ctx) => {
  ctx.reply(
    "🆘 How to Download Movies\n\n" +
    "1️⃣ Join our channel 👇\n" +
    "2️⃣ Click any movie post\n" +
    "3️⃣ Choose video quality\n\n" +
    "⚠️ If a movie is unavailable, check the channel for new posts.",
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Subscribe to Channel", url: "https://t.me/+4hLpchjjlVJkNDdl" }]]
      }
    }
  );
});

bot.command("channel", (ctx) => {
  ctx.reply("📢 Movie Channel", {
    reply_markup: {
      inline_keyboard: [[{ text: "Join Channel", url: "https://t.me/+4hLpchjjlVJkNDdl" }]]
    }
  });
});

bot.command("latest", require("./commands/latest"));

/* =========================
   ADMIN COMMAND HANDLERS
   ========================= */
bot.command("admin", adminCommand);
bot.command("checkmovie", adminCommand);
bot.command("refreshcache", adminCommand);

/* =========================
   CALLBACK HANDLERS
   ========================= */
bot.action(/^no_link_(.+)/, (ctx) => {
  const quality = ctx.match[1];
  ctx.reply(`❌ The ${quality} link is not available.`);
  ctx.answerCbQuery();
});

bot.action(/^download_(.+)_(.+)/, async (ctx) => {
  const movieKey = ctx.match[1];
  const quality = ctx.match[2];

  const movies = await getMoviesFromSheet();
  const movie = movies.find(m => m.key === movieKey && m.status === "active");

  if (!movie) {
    ctx.reply("❌ Movie not found or no longer available.");
    ctx.answerCbQuery();
    return;
  }

  const url = movie.links[quality];
  if (!url) {
    ctx.reply(`❌ The ${quality} link is not available.`);
    ctx.answerCbQuery();
    return;
  }

  // Check subscription to both channels
  const REQUIRED_CHANNELS = [
    { type: 'username', value: '@movieplusehindi', link: 'https://t.me/movieplusehindi', name: 'MoviePluse Hindi' },
    { type: 'chatId', value: process.env.PRIVATE_GROUP_ID, link: 'https://t.me/+4hLpchjjlVJkNDdl', name: 'Private Group' }
  ];

  let unsubscribedChannels = [];

  for (const channel of REQUIRED_CHANNELS) {
    try {
      const chatIdentifier = channel.value;
      const member = await ctx.telegram.getChatMember(chatIdentifier, ctx.from.id);
      if (member.status === 'left' || member.status === 'kicked') {
        unsubscribedChannels.push(channel);
      }
    } catch (e) {
      unsubscribedChannels.push(channel);
    }
  }

  // If user is not subscribed to all channels
  if (unsubscribedChannels.length > 0) {
    const keyboard = unsubscribedChannels.map(channel => 
      [{ text: `Subscribe to ${channel.name}`, url: channel.link }]
    );
    
    ctx.reply("📢 Please subscribe to all channels first to access downloads:", {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
    ctx.answerCbQuery();
    return;
  }

  // All subscriptions verified, provide download
  ctx.reply(`🎥 Download ${movie.title} (${quality}):`, {
    reply_markup: {
      inline_keyboard: [[{ text: "Download Now", url }]]
    }
  });
  ctx.answerCbQuery();
});

/* =========================
   GLOBAL COMMAND MENU
   ========================= */
bot.telegram.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "latest", description: "Latest movies" },
  { command: "channel", description: "Open movie channel" },
  { command: "help", description: "How to use the bot" }
]);

/* =========================
   ADMIN COMMAND MENU
   ========================= */
bot.telegram.setMyCommands([
  { command: "start", description: "Start the bot" },
  { command: "latest", description: "Latest movies" },
  { command: "channel", description: "Open movie channel" },
  { command: "help", description: "How to use the bot" },
  { command: "admin", description: "Admin panel" },
  { command: "checkmovie", description: "Check movie by key" },
  { command: "refreshcache", description: "Refresh cache" }
], {
  scope: { type: 'chat', chat_id: process.env.ADMIN_ID }
});

/* =========================
   START BOT
   ========================= */
bot.launch();
console.log("🤖 Bot running (Google Sheet only)");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
