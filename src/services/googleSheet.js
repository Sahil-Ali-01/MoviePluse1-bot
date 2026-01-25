const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// Public CSV export URL
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

let cache = {
  data: null,
  lastFetch: 0,
};

const CACHE_TIME = 60 * 1000; // 1 minute

// =========================
// Fetch movies from sheet
// =========================
module.exports.getMoviesFromSheet = async () => {
  const now = Date.now();

  // Return cached data if fresh
  if (cache.data && now - cache.lastFetch < CACHE_TIME) {
    return cache.data;
  }

  // Use Node.js global fetch
  const res = await fetch(SHEET_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch Google Sheet");
  }

  const text = await res.text();

  const rows = text
    .split("\n")
    .slice(1)
    .map(row =>
      row.split(",").map(cell =>
        cell.replace(/^"|"$/g, "").trim()
      )
    );

  const movies = rows
    .filter(r => r.length >= 9 && r[0])
    .map(([key, title, p480, p720, p1080, p480_size, p720_size, p1080_size, status]) => ({
      key,
      title,
      links: {
        "480p": p480,
        "720p": p720,
        "1080p": p1080,
      },
      sizes: {
        "480p": p480_size,
        "720p": p720_size,
        "1080p": p1080_size,
      },
      status,
    }));

  cache = { data: movies, lastFetch: now };
  return movies;
};

// =========================
// Clear cache (admin use)
// =========================
module.exports.clearCache = () => {
  cache = { data: null, lastFetch: 0 };
};
