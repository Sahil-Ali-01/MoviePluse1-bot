require("dotenv").config();
const { Telegraf } = require("telegraf");

const startCommand = require("./commands/start");
const adminCommand = require("./commands/admin");

const bot = new Telegraf(process.env.BOT_TOKEN);

/* =========================
   USER COMMANDS
   ========================= */
bot.command("start", startCommand);

bot.command("help", (ctx) => {
  ctx.reply(
    "🆘 How to Download Movies\n\n" +
    "1️⃣ Join our channel @movieplusehindi\n" +
    "2️⃣ Click any movie post\n" +
    "3️⃣ Choose video quality\n\n" +
    "⚠️ If a movie is unavailable, check the channel for new posts."
  );
});

bot.command("channel", (ctx) => {
  ctx.reply("📢 Movie Channel 👉 @movieplusehindi");
});

bot.command("latest", require("./commands/latest"));

/* =========================
   ADMIN COMMAND HANDLERS
   ========================= */
bot.command("admin", adminCommand);
bot.command("checkmovie", adminCommand);
bot.command("refreshcache", adminCommand);

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
   START BOT
   ========================= */
bot.launch();
console.log("🤖 Bot running (Google Sheet only)");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
