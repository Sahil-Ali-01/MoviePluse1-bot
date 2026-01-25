require("dotenv").config();
const { Telegraf } = require("telegraf");

const startCommand = require("./commands/start");
const adminCommand = require("./commands/admin");
const { getMoviesFromSheet } = require("./services/googleSheet");

const bot = new Telegraf(process.env.BOT_TOKEN);

/* =========================
   USER COMMANDS
   ========================= */
bot.command("start", startCommand);

bot.command("help", (ctx) => {
  ctx.reply(
    "🆘 How to Download Movies\n\n" +
    "1️⃣ Join our channels 👇\n" +
    "2️⃣ Click any movie post\n" +
    "3️⃣ Choose video quality\n\n" +
    "⚠️ If a movie is unavailable, check the channel for new posts.",
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "MoviePluse Hindi", url: "https://t.me/movieplusehindi" }],
          [{ text: "Special Offers", url: "https://t.me/specialoffer12" }]
        ]
      }
    }
  );
});

bot.command("channel", (ctx) => {
  ctx.reply("📢 Our Channels", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "MoviePluse Hindi", url: "https://t.me/movieplusehindi" }],
        [{ text: "Special Offers", url: "https://t.me/specialoffer12" }]
      ]
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
    { type: 'username', value: '@specialoffer12', link: 'https://t.me/specialoffer12', name: 'Special Offers' }
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
    
    ctx.reply("📢 Please subscribe to our channels first to access downloads:", {
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
