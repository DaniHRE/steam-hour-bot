import SteamClient from './core/SteamClient';
import express, { Request, Response } from 'express';
import { log } from './utils';
import { fetchGameNames } from './services';

// Create an Express app
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

const steamClient = new SteamClient();

// Endpoint to start the bot
app.post('/start-bot', async (req: Request, res: Response) => {
    const { username, password, otp, gamesId } = req.body;

    if (!username || !password || !otp || !gamesId) {
        return res.status(400).json({ error: "Missing username, password, OTP, or Games ID." });
    }

    if(steamClient.isRunning()){
        return res.status(400).json({ error: "Bot is already running." });
    }

    if (gamesId.length <= 30) {
        log(`Initializing ${gamesId.length} games...`);
    } else {
        log(`Exceeded the limit of 30 games (${gamesId.length} provided). Logging off...`);
    }

    const games = await fetchGameNames(gamesId);
    steamClient.start(username, password, otp, games)
    res.status(200).send({ message: "Bot started successfully." });
});


// Graceful shutdown endpoint
app.post('/stop-bot', (req: Request, res: Response) => {
    if (!steamClient.isRunning()) {
        return res.status(400).json({ error: "Bot is not running." });
    }

    steamClient.stop();

    res.json({ message: "Bot stopped successfully." });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});