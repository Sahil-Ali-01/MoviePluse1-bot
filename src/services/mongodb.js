const { getDb } = require("./db");

let cache = {
    data: null,
    lastFetch: 0,
};

const CACHE_TIME = 60 * 1000; // 1 minute

// =========================
// Fetch movies from MongoDB
// =========================
async function getMovies() {
    const now = Date.now();

    // Return cached data if fresh
    if (cache.data && now - cache.lastFetch < CACHE_TIME) {
        return cache.data;
    }

    const db = getDb();
    const movies = await db
        .collection("movies")
        .find({})
        .toArray();

    // Transform to match existing format
    const formattedMovies = movies.map((doc) => ({
        key: doc.key,
        title: doc.title,
        links: doc.links || {
            "480p": "",
            "720p": "",
            "1080p": "",
        },
        sizes: doc.sizes || {
            "480p": "",
            "720p": "",
            "1080p": "",
        },
        status: doc.status || "active",
    }));

    cache = { data: formattedMovies, lastFetch: now };
    return formattedMovies;
}

// =========================
// Clear cache (admin use)
// =========================
function clearCache() {
    cache = { data: null, lastFetch: 0 };
}

// =========================
// Add a movie to MongoDB
// =========================
async function addMovie(movieData) {
    const db = getDb();

    // Check if movie with same key already exists
    const existing = await db.collection("movies").findOne({ key: movieData.key });
    if (existing) {
        throw new Error(`Movie with key '${movieData.key}' already exists.`);
    }

    const result = await db.collection("movies").insertOne({
        key: movieData.key,
        title: movieData.title,
        links: movieData.links || {},
        sizes: movieData.sizes || {},
        status: movieData.status || "active"
    });

    return result;
}

// =========================
// Delete a movie from MongoDB
// =========================
async function deleteMovie(key) {
    const db = getDb();
    const result = await db.collection("movies").deleteOne({ key });
    return result;
}

module.exports = { getMovies, clearCache, addMovie, deleteMovie };

