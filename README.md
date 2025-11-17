# Bourse Bot Economy

A modern Discord bot focused on virtual economy, lotteries, and a simulated stock market built with TypeScript, discord.js v14, and Prisma/PostgreSQL.

## Features
- Rich user profiles with wallet, bank, XP, reputation, and stats
- Economy commands (daily, balance, give, etc.) with cooldowns and anti-abuse checks
- Simulated stock market with portfolio tracking
- Lottery rounds every 15 minutes with automatic drawing
- Admin configuration per guild
- Modular architecture with command and service layers

## Getting Started

### Requirements
- Node.js 18+
- PostgreSQL database

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file based on the following variables:
   ```env
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_application_id
   DATABASE_URL=postgresql://user:password@localhost:5432/boursebot
   LOG_LEVEL=info
   ```
3. Generate the Prisma client and run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Start the bot in development:
   ```bash
   npm run dev
   ```
5. Build and run for production:
   ```bash
   npm run build
   npm start
   ```

## Project Structure
- `src/index.ts` – entrypoint, loads commands and events
- `src/commands` – slash commands grouped by domain
- `src/services` – business logic for economy, stocks, lottery
- `src/jobs` – background schedulers (lottery sweep)
- `prisma/schema.prisma` – database schema

## Notes
- Ensure the bot has the `applications.commands` scope and appropriate guild permissions.
- Use `npx prisma studio` to inspect data during development.
