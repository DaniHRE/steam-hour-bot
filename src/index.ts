// Import required modules
import SteamUser from 'steam-user';
import readlineSync from 'readline-sync';
import { log } from './utils';

// Load settings
import settings from '../config.json';

import { shuffleArray } from './utils';

// Initialize Steam client
const client = new SteamUser();

// Prompt user for login details
const username: string = readlineSync.question("[ACCOUNT] Steam Username: ");
const password: string = readlineSync.question("[ACCOUNT] Steam Password: ");
const mobileCode: string = readlineSync.question("[STEAM GUARD] Steam App Code: ");

// Handle client login
client.logOn({
    accountName: username,
    password: password,
    twoFactorCode: mobileCode
});

client.on('loggedOn', () => {
    log("Initializing Steam Client..");
    client.setPersona(SteamUser.EPersonaState.Online);
    const shuffledGames = shuffleArray(settings.games);
    client.gamesPlayed(shuffledGames);
    initializeGames(shuffledGames);
});

// Handle friend messages
// @ts-ignore due to wrong typing in library
client.on('friendMessage', (steamID, message) => {
    const replies: { [key: string]: string } = {
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

    // Check if any reply key is a substring of the message
    const foundKey = Object.keys(replies).find(key => message.toLowerCase().includes(key));

    if (foundKey) {
        // @ts-ignore due to wrong typing in library
        client.chatMessage(steamID, replies[foundKey]);
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
