# MoviePluse Bot - AI Coding Guidelines

## Architecture Overview
This is a Node.js Telegram bot using Telegraf that serves movie download links from a Google Sheets database. Movies are fetched via public CSV export with 1-minute caching. The bot runs on Render with an HTTP keep-alive server.

**Key Components:**
- `src/bot.js`: Main bot setup with command handlers
- `src/commands/`: Individual command modules (start, latest, admin)
- `src/services/googleSheet.js`: Data fetching and caching service
- `src/utils/keyboard.js`: Inline keyboard generators

## Data Flow
1. Google Sheet stores movies with columns: key, title, 480p, 720p, 1080p, 480p_size, 720p_size, 1080p_size, status
2. `getMoviesFromSheet()` fetches CSV, parses to movie objects with `links` and `sizes` objects
3. Commands filter active movies and generate Telegram responses with inline keyboards

## Critical Workflows
- **Start Bot**: `npm start` (runs `node index.js`)
- **Admin Check**: Compare `ctx.from.id` with `process.env.ADMIN_ID` as string
- **Movie Payloads**: Encode movie keys with `Buffer.from(key).toString("base64url")` for start links
- **Cache Management**: Use `clearCache()` for admin refresh, data cached 60 seconds

## Project Conventions
- **Movie Status**: Only "active" (case-insensitive) movies are shown
- **Latest Movies**: Take last 5 rows from sheet, reverse for newest-first display
- **Quality Selection**: Use `movieKeyboard(movie.links)` for inline buttons linking to download URLs
- **Error Handling**: Fallback to channel link when movie unavailable, suggest 3 alternatives
- **Admin Commands**: `/checkmovie key`, `/refreshcache` - require admin auth

## Examples
- **Find Movie by Key**: `movies.find(m => m.key === payload && m.status === "active")`
- **Generate Start Link**: `https://t.me/${BOT_USERNAME}?start=${Buffer.from(m.key).toString("base64url")}`
- **Parse CSV Row**: `[key, title, p480, p720, p1080, p480_size, p720_size, p1080_size, status] => {key, title, links: {"480p": p480, ...}, sizes: {"480p": p480_size, ...}, status}`

## Dependencies
- `telegraf`: Bot framework
- `dotenv`: Environment variables (BOT_TOKEN, ADMIN_ID, GOOGLE_SHEET_ID, PORT)

Focus on Telegraf patterns, Google Sheets integration, and Telegram inline keyboards for movie quality selection.