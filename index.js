require("dotenv").config({
  path: process.env.DOTENV_CONFIG_PATH || ".env"
});


// require("dotenv").config();
const http = require("http");

// 🔴 REQUIRED FOR RENDER FREE WEB SERVICE
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Telegram bot is running");
}).listen(PORT, () => {
  console.log("🌐 HTTP server running on port", PORT);
});

// =========================
// START TELEGRAM BOT
// =========================
require("./src/bot");
