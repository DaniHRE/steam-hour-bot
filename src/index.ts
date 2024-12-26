// Import required modules
import SteamUser from 'steam-user';
import readlineSync from 'readline-sync';
import { getScriptUptime, getTimeInGMT3, log } from './utils';
import { shuffleArray } from './utils';
import { fetchGameNames } from './services';

//Env Vars
const STEAMUSER = process.env.STEAMUSER as string
const STEAMPW = process.env.STEAMPW as string
const STEAMOTP = process.env.STEAMOTP as string
const GAMES = JSON.parse(process.env.GAMES as string) as number[];

// Pre-fetch game names at the start of the script
let globalGameNames: { [key: number]: string } = {};
const initializeGameNames = async () => {
    globalGameNames = await fetchGameNames(GAMES);
};

// Initialize game names
initializeGameNames().then(() => log("Game Names Initialized"));

// Initialize Steam client
const client = new SteamUser();

// Track script start time
export const scriptStartTime = Date.now();

// Handle client login
client.logOn({
    accountName: !STEAMUSER ? readlineSync.question("[ACCOUNT] Steam Username: ") : STEAMUSER,
    password: !STEAMPW ? readlineSync.question("[ACCOUNT] Steam Password: ") : STEAMPW,
    twoFactorCode: !STEAMOTP ? readlineSync.question("[STEAM GUARD] Steam App Code: ") : STEAMOTP
});

client.on('loggedOn', () => {
    log("Initializing Steam Client..");
    client.setPersona(SteamUser.EPersonaState.Online);
    const shuffledGames = shuffleArray(GAMES);
    client.gamesPlayed(shuffledGames);
    initializeGames(shuffledGames);
});

// Handle friend messages
// @ts-ignore due to wrong typing in library
client.on('friendMessage', (steamID, message) => {
    const conversationReplies: { [key: string]: string } = {
        "oi": "Eai, blz?",
        "jogar": "Bora, só deixa eu terminar essa.",
        "sim": "Pode crê",
        "não": "De boa, a gente troca ideia outra hora!",
        "tchau": "Vlw man, flw",
        "obrigado": "Dnd",
        "como você está": "Tudo certo por aqui! E contigo?",
        "vamos jogar agora": "Estou um pouco ocupado agora, mas depois podemos jogar!",
        "qual jogo você gosta": "Gosto de vários jogos, ultimamente tenho jogado alguns clássicos. E você?",
        "que horas são": "Boa pergunta! Dá uma olhada aí no relógio do dispositivo.",
        "qual é seu nome": "Ah, apenas alguém pronto pra jogar. E o seu?",
        "está aí?": "Estou por aqui, sim. O que precisa?",
        "preciso de ajuda": "Claro, só dizer o que precisa e vamos resolver!",
        "vamos marcar um dia": "Boa ideia! Só me dizer quando seria bom para você.",
        "quais jogos você tem": "Ah, alguns bem legais, depende do que gosta. Quer sugerir algo?",
        "qual seu nível?": "Eu diria que sou mediano! Depende do jogo também, e você?"
    };

    // Define interaction replies
    const interactionReplies: { [key: string]: () => string } = {
        "!stats": () => {
            const timeGMT3 = getTimeInGMT3();
            const uptime = getScriptUptime();
            const gamesList = Object.entries(globalGameNames)
                .map(([id, name]) => `- ${name} (ID: ${id})`)
                .join('\n');

            console.log(`[STATS] Time (GMT-3): ${timeGMT3}`);
            console.log(`[STATS] Uptime: ${uptime}`);
            console.log(`[STATS] Games Running:\n${gamesList}`);

            return `Stats:\n- Time (GMT-3): ${timeGMT3}\n- Uptime: ${uptime}\n- Games Running:\n${gamesList}`;
        }
    };

    //Check if any interaction command is triggered in message
    const foundInteraction = Object.keys(interactionReplies).find(key => message.toLowerCase().includes(key));
    if (foundInteraction) {
        // @ts-ignore due to wrong typing in library
        client.chatMessage(steamID, interactionReplies[foundInteraction]());
        return
    }

    // Check if any reply key is a substring of the message
    const foundKey = Object.keys(conversationReplies).find(key => message.toLowerCase().includes(key));

    if (foundKey) {
        // @ts-ignore due to wrong typing in library
        client.chatMessage(steamID, conversationReplies[foundKey]);
    } else {
        // @ts-ignore due to wrong typing in library
        client.chatMessage(steamID, "Fala ai fdp");
    }
});

// Handle errors
client.on('error', (err: any) => {
    switch (err.eresult) {
        case SteamUser.EResult.InvalidPassword:
            log("Login Failed: Invalid Password.");
            shutdown(1);
            break;
        case SteamUser.EResult.AlreadyLoggedInElsewhere:
            log("Login Failed: Already logged in elsewhere.");
            shutdown(1);
            break;
        case SteamUser.EResult.AccountLogonDenied:
            log("Login Failed: Steam Guard required.");
            shutdown(1);
            break;
        default:
            log(`Login Failed: ${err.message}`);
            shutdown(1);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    log("Logging off...");
    shutdown(0);
});

const initializeGames = (games: string[]): void => {
    if (games.length <= 30) {
        log(`Initializing ${games.length} games...`);
    } else {
        log(`Exceeded the limit of 30 games (${games.length} provided). Logging off...`);
        shutdown(1);
    }
};

const shutdown = (code: number): void => {
    client.logOff();
    client.once('disconnected', () => process.exit(code));

    setTimeout(() => process.exit(code), 500);
};
