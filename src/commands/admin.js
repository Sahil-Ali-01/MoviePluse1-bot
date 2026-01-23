const { getMoviesFromSheet, clearCache } = require("../services/googleSheet");

module.exports = async (ctx) => {
  // 🔐 ADMIN CHECK
  if (String(ctx.from.id) !== String(process.env.ADMIN_ID)) {
    return ctx.reply("❌ Unauthorized");
  }

  const text = ctx.message.text.trim();

  // =====================
  // /admin
  // =====================
  if (text === "/admin") {
    return ctx.reply(
      "🛠 Admin Commands\n\n" +
      "/checkmovie key\n" +
      "/refreshcache\n\n" +
      "✏️ Edit movies directly in Google Sheet"
    );
  }

  // =====================
  // /refreshcache
  // =====================
  if (text === "/refreshcache") {
    clearCache();
    return ctx.reply("♻️ Cache refreshed.");
  }

  // =====================
  // /checkmovie key
  // =====================
  if (text.startsWith("/checkmovie")) {
    const key = text.replace("/checkmovie", "").trim();

    if (!key) {
      return ctx.reply("Usage:\n/checkmovie movie_key");
    }

    const movies = await getMoviesFromSheet();
    const movie = movies.find(m => m.key === key);

    if (!movie) {
      return ctx.reply("❌ Movie not found.");
    }

    return ctx.reply(
      `🎬 ${movie.title}\n` +
      `Status: ${movie.status}`
    );
  }

  return ctx.reply("❓ Unknown admin command.");
};
