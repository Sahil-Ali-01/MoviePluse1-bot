const { getMoviesFromSheet } = require("../services/googleSheet");
const { movieKeyboard } = require("../utils/keyboard");

module.exports = async (ctx) => {
  const payload = ctx.payload
    ? Buffer.from(ctx.payload, "base64url").toString()
    : null;

  // Normal /start
  if (!payload) {
    return ctx.reply(
      "🎬 Welcome to MoviePluse Bot\n\n" +
      "📢 Movies are posted in our channel.\n" +
      "👉 Click any movie link there to download.\n\n" +
      "Channel: @movieplusehindi"
    );
  }

  const movies = await getMoviesFromSheet();

  const movie = movies.find(
    (m) => m.key === payload && m.status === "active"
  );

  // ❌ MOVIE NOT AVAILABLE → FALLBACK WITH SUGGESTIONS
  if (!movie) {
    const BOT_USERNAME = ctx.botInfo.username;

    const alternatives = movies
      .filter((m) => m.status === "active" && m.key !== payload)
      .slice(-3)
      .reverse();

    let text =
      "❌ This movie is no longer available.\n\n" +
      "🎯 You may like these movies:\n\n";

    alternatives.forEach((m, i) => {
      const safeKey = Buffer.from(m.key).toString("base64url");
      const link = `https://t.me/${BOT_USERNAME}?start=${safeKey}`;
      text += `${i + 1}. 🎬 ${m.title}\n👉 ${link}\n\n`;
    });

    return ctx.reply(text.trim(), {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📢 Open Movie Channel", url: "https://t.me/movieplusehindi" }]
        ]
      }
    });
  }

  // ✅ MOVIE FOUND
  return ctx.reply(
    `🎬 ${movie.title}\n\nSelect quality 👇`,
    { reply_markup: movieKeyboard(movie.links) }
  );
};
