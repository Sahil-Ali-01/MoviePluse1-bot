# 🎬 MoviePluse Bot

A Telegram bot for sharing and downloading movies with multiple quality options. Powered by MongoDB Atlas.

[![Bot](https://img.shields.io/badge/Telegram-Bot-blue?logo=telegram)](https://t.me/MoviePluse1_bot)
[![Channel](https://img.shields.io/badge/Channel-MoviePluse-blue?logo=telegram)](https://t.me/movieplusehindi)

## ✨ Features

- 🎥 **Movie Downloads** - Multiple quality options (480p, 720p, 1080p)
- 📢 **Channel Integration** - Links to movie channels
- 🔐 **Subscription Verification** - Users must join channels to download
- 👤 **Admin Panel** - Add, delete, and manage movies via Telegram
- ⚡ **Fast & Cached** - 1-minute cache for quick responses
- 🌐 **Cloud Ready** - Deployable on Render, Railway, etc.

---

## 🤖 Bot Commands

### For Users

| Command | Description |
|---------|-------------|
| `/start` | Start the bot / Open movie link |
| `/latest` | View latest 5 movies |
| `/channel` | Join our movie channels |
| `/help` | How to download movies |

### For Admins

| Command | Description |
|---------|-------------|
| `/admin` | Show admin commands |
| `/addmovie` | Add a new movie |
| `/deletemovie <key>` | Delete a movie |
| `/listmovies` | List all movies |
| `/checkmovie <key>` | Check movie details |
| `/refreshcache` | Clear cache |

---

## 📝 How to Add Movies (Admin)

Send this format to the bot:

```
/addmovie
key: avengers_endgame
title: Avengers Endgame (2019)
480p: https://download-link.com/480p | 400MB
720p: https://download-link.com/720p | 900MB
1080p: https://download-link.com/1080p | 2.1GB
```

> ⚠️ `key` and `title` are required. At least one quality link is required.

---

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### Environment Variables

Create a `.env` file:

```env
BOT_TOKEN=your_telegram_bot_token
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/moviebot
ADMIN_ID=your_telegram_user_id
PORT=3000
```

### Install & Run

```bash
npm install
npm start
```

---

## 📊 MongoDB Schema

**Collection:** `movies`

```json
{
  "key": "unique_movie_key",
  "title": "Movie Title (Year)",
  "links": {
    "480p": "https://...",
    "720p": "https://...",
    "1080p": "https://..."
  },
  "sizes": {
    "480p": "400MB",
    "720p": "800MB",
    "1080p": "1.5GB"
  },
  "status": "active"
}
```

---

## 📁 Project Structure

```
├── index.js              # Entry point
├── src/
│   ├── bot.js            # Bot configuration
│   ├── commands/
│   │   ├── start.js      # /start command
│   │   ├── latest.js     # /latest command
│   │   └── admin.js      # Admin commands
│   ├── services/
│   │   ├── db.js         # MongoDB connection
│   │   └── mongodb.js    # Movie CRUD operations
│   └── utils/
│       └── keyboard.js   # Inline keyboard builder
└── package.json
```

---

## 📢 Channels

- **MoviePluse Hindi**: [@movieplusehindi](https://t.me/movieplusehindi)
- **Special Offers**: [@specialoffer12](https://t.me/specialoffer12)

---

## 📄 License

MIT License
