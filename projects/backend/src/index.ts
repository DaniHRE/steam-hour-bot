import express, { Request, Response } from 'express';
import { log } from './utils';
import { fetchGameNames } from './services';
import SteamClientManager from './core/SteamClientManager';

const cors = require('cors');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim())) || [
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true); // non-browser or same-origin
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
}));
app.options('*', cors());

const steamClientManager = new SteamClientManager();

// Endpoint to start the bot
app.post('/start-bot', async (req: Request, res: Response) => {
    const { clientId, username, password, otp, gamesId } = req.body;

    if (!clientId || !username || !password || !otp || !gamesId) {
        return res.status(400).json({ error: "Missing clientId, username, password, OTP, or Games ID." });
    }

    const steamClient = await steamClientManager.getClient(clientId);

    if (!steamClient) {
        return res.status(400).json({ error: "Client don't exist" });
    }

    if (gamesId.length > 30) {
        return res.status(400).json({ error: `Exceeded the limit of 30 games (${gamesId.length} provided). Maximum is 30.` });
    }

    log(`Attempting to start bot with ${gamesId.length} games...`);

    try {
        const games = await fetchGameNames(gamesId);
        const result = await steamClient.start(username, password, otp, games);

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        res.status(200).json({ message: "Bot started successfully." });
    } catch (error) {
        log(`Error starting bot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).json({ error: "Internal server error while starting bot." });
    }
});


// Stop only the client name bot session
app.post('/stop-bot', (req: Request, res: Response) => {
    const { clientId } = req.body;

    if (!clientId) {
        return res.status(400).json({ error: "Missing clientId" });
    }

    const steamClient = steamClientManager.getClient(clientId);

    if (!steamClient) {
        return res.status(400).json({ error: "Client don't exist" });
    }

    const isStopped = steamClient.stop();

    if(!isStopped){
        return res.status(400).json({ error: "Bot is not running."});
    }

    res.json({ message: "Bot stopped successfully." });
});

// Get all client sessions active
app.get('/clients', async (req: Request, res: Response) => {
    res.json(await steamClientManager.getAllClients());
});

// Get a single client session
app.get('/client/:id', async (req: Request, res: Response) => {
    const {id} = req.params;

    if(!id){
        return res.status(400).json({ error: "Missing clientId." });
    }

    const client = await steamClientManager.getClient(id)?.getInfo();

    if (!client) {
        return res.status(404).json({ error: "Client don't exist" });
    }

    res.json(client);
})

app.post('/client', (req: Request, res: Response) => {
    const clientId = steamClientManager.createClient();
    res.json({ message: "Client Created Sucessfully", clientId: clientId});
});

// Get a single client session
app.delete('/client', (req: Request, res: Response) => {
    const {clientId} = req.body;

    if(!clientId){
        return res.status(400).json({ error: "Missing clientId." });
    }

    const steamClient = steamClientManager.getClient(clientId);

    if (!steamClient) {
        return res.status(400).json({ error: "Client don't exist" });
    }

    steamClientManager.destroyClient(clientId);

    return res.status(200).json({message: "Client deleted successfully."})
});

// Health check
app.get('/health-check', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});