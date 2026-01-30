const { MongoClient } = require("mongodb");

let client = null;
let db = null;

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (db) return db;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  
  db = client.db(); // Uses database from connection string
  console.log("✅ Connected to MongoDB");
  
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("🔌 MongoDB connection closed");
  }
}

module.exports = { connectDB, getDb, closeDB };
