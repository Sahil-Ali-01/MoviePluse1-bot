const { getMoviesFromSheet } = require("../services/googleSheet");

module.exports = async (ctx) => {
  const LIMIT = 5;

  // ✅ SAFE: ctx exists here
  const BOT_USERNAME = ctx.botInfo.username;

  const movies = await getMoviesFromSheet();

  // Only active movies
  const activeMovies = movies.filter(
    (m) => m.status && m.status.toLowerCase() === "active"
  );

  if (activeMovies.length === 0) {
    return ctx.reply("⚠️ No movies available right now.");
  }

  // Latest = bottom rows in sheet
  const latest = activeMovies.slice(-LIMIT).reverse();

  const message = latest
    .map((m, i) => {
      const safeKey = Buffer.from(m.key).toString("base64url"); // 🔐 payload safe
      const link = `https://t.me/${BOT_USERNAME}?start=${safeKey}`;
      return `${i + 1}. 🎬 ${m.title}\n👉 ${link}`;
    })
    .join("\n\n");

  return ctx.reply(
    `🔥 <b>Latest Movies</b>\n\n${message}`,
    { parse_mode: "HTML" }
  );
};
