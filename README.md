# Steam Bot

This project is a bot designed to interact with the Steam client and farm HOURS on the platform by operating up to 30 games simultaneously.

## Features

- Automatic replies based on predefined messages.
- `!stats` command (in the chat with the logged-in account) to display information about:
  - Current time (GMT-3).
  - Script uptime (HH:MM:SS).
  - Games currently running.

## Requirements

- **Node.js** (version 20 or higher).
- A valid Steam account.
- Dependency libraries managed via `npm` or `pnpm`.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/DaniHRE/steam-hour-bot
   cd steam-hour-bot
   ```

2. Install the project dependencies:

   ```bash
   npm install
   ```

3. Set up the environment variables in the `.env` file:

   ```env
   STEAMUSER=<your_steam_username>
   STEAMPW=<your_steam_password>
   STEAMOTP=<your_otp_code>
   GAMES="[730, 440, 570]" # Steam game IDs to run
   ```

4. Make sure Steam services are operational.

## Usage

### Starting the Bot

Run the following command to start the bot:

```bash
npm start
```

The bot will log in to your Steam account and start running the games defined in `GAMES`.

### `!stats` Command

Send the `!stats` command to the bot in a Steam chat to get information about:
- Current time (GMT-3).
- Script runtime.
- List of games currently running.

## Project Structure
```
<PROJECT_FOLDER>/
├── services/              # Auxiliary services (e.g., fetchGameNames)
├── utils/                 # Utility functions (e.g., logging, uptime)
├── .env                   # Environment variables
├── index.ts               # Main bot file
├── package.json           # Node.js project configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## Dependencies

- [steam-user](https://www.npmjs.com/package/steam-user) - Interface with the Steam client.
- [readline-sync](https://www.npmjs.com/package/readline-sync) - Synchronous user input.
- [axios](https://www.npmjs.com/package/axios) - HTTP requests for the Steam API.
- [express](https://www.npmjs.com/package/express) - Basic HTTP server.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
