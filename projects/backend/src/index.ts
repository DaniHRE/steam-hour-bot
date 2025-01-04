import express, { Request, Response } from 'express';
import { log } from './utils';
import { fetchGameNames } from './services';
import SteamClientManager from './core/SteamClientManager';

const cors = require('cors');

// Create an Express app
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: `http://localhost:5173`
}));

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

    if (gamesId.length <= 30) {
        log(`Initializing ${gamesId.length} games...`);
    } else {
        log(`Exceeded the limit of 30 games (${gamesId.length} provided). Logging off...`);
    }

    const games = await fetchGameNames(gamesId);
    const isStarted = steamClient.start(username, password, otp, games)

    if(!isStarted){
        return res.status(400).json({ error: "Bot is already running." });
    }

    res.status(200).send({ message: "Bot started successfully." });
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

    const client = steamClientManager.getClient(id)?.getInfo();

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