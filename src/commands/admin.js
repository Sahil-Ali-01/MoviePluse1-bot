const { getMovies, clearCache, addMovie, deleteMovie } = require("../services/mongodb");

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
      "/addmovie - Add a new movie\n" +
      "/deletemovie <key> - Delete a movie\n" +
      "/checkmovie <key> - Check movie details\n" +
      "/listmovies - List all movies\n" +
      "/refreshcache - Clear cache"
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
  // /listmovies
  // =====================
  if (text === "/listmovies") {
    const movies = await getMovies();
    if (movies.length === 0) {
      return ctx.reply("📭 No movies in database.");
    }

    const list = movies.map((m, i) =>
      `${i + 1}. ${m.title} (${m.key}) - ${m.status}`
    ).join("\n");

    return ctx.reply(`🎬 Movies (${movies.length}):\n\n${list}`);
  }

  // =====================
  // /addmovie (multi-line format)
  // =====================
  if (text.startsWith("/addmovie")) {
    const lines = text.split("\n").slice(1); // Remove /addmovie line

    if (lines.length < 3) {
      return ctx.reply(
        "📝 Usage:\n\n" +
        "/addmovie\n" +
        "key: movie_key\n" +
        "title: Movie Title (2024)\n" +
        "480p: https://link.com/480p | 400MB\n" +
        "720p: https://link.com/720p | 800MB\n" +
        "1080p: https://link.com/1080p | 1.5GB\n\n" +
        "⚠️ Links with size are optional. At least one quality is required."
      );
    }

    try {
      const movieData = {
        links: {},
        sizes: {},
        status: "active"
      };

      for (const line of lines) {
        const [field, ...valueParts] = line.split(":");
        const value = valueParts.join(":").trim();
        const fieldLower = field.trim().toLowerCase();

        if (fieldLower === "key") {
          movieData.key = value;
        } else if (fieldLower === "title") {
          movieData.title = value;
        } else if (fieldLower === "status") {
          movieData.status = value.toLowerCase();
        } else if (["480p", "720p", "1080p"].includes(fieldLower)) {
          // Parse: https://link.com | 400MB
          const [url, size] = value.split("|").map(s => s.trim());
          movieData.links[fieldLower] = url || "";
          movieData.sizes[fieldLower] = size || "";
        }
      }

      if (!movieData.key || !movieData.title) {
        return ctx.reply("❌ Error: 'key' and 'title' are required.");
      }

      if (!movieData.links["480p"] && !movieData.links["720p"] && !movieData.links["1080p"]) {
        return ctx.reply("❌ Error: At least one quality (480p/720p/1080p) is required.");
      }

      const result = await addMovie(movieData);
      clearCache();

      return ctx.reply(
        `✅ Movie added successfully!\n\n` +
        `🎬 ${movieData.title}\n` +
        `🔑 Key: ${movieData.key}\n` +
        `📊 Status: ${movieData.status}`
      );
    } catch (err) {
      return ctx.reply(`❌ Error: ${err.message}`);
    }
  }

  // =====================
  // /deletemovie key
  // =====================
  if (text.startsWith("/deletemovie")) {
    const key = text.replace("/deletemovie", "").trim();

    if (!key) {
      return ctx.reply("Usage:\n/deletemovie movie_key");
    }

    try {
      const result = await deleteMovie(key);
      clearCache();

      if (result.deletedCount === 0) {
        return ctx.reply("❌ Movie not found.");
      }

      return ctx.reply(`✅ Movie '${key}' deleted.`);
    } catch (err) {
      return ctx.reply(`❌ Error: ${err.message}`);
    }
  }

  // =====================
  // /checkmovie key
  // =====================
  if (text.startsWith("/checkmovie")) {
    const key = text.replace("/checkmovie", "").trim();

    if (!key) {
      return ctx.reply("Usage:\n/checkmovie movie_key");
    }

    const movies = await getMovies();
    const movie = movies.find(m => m.key === key);

    if (!movie) {
      return ctx.reply("❌ Movie not found.");
    }

    const qualities = Object.entries(movie.links)
      .filter(([q, url]) => url)
      .map(([q, url]) => `${q}: ${movie.sizes[q] || "N/A"}`)
      .join("\n");

    return ctx.reply(
      `🎬 ${movie.title}\n` +
      `🔑 Key: ${movie.key}\n` +
      `📊 Status: ${movie.status}\n\n` +
      `📦 Qualities:\n${qualities || "None"}`
    );
  }

  return ctx.reply("❓ Unknown admin command. Use /admin for help.");
};
