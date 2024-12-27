import SteamUser from "steam-user";
import { log } from "../utils";
import { getScriptUptime, getTimeInGMT3, shuffleArray } from "../utils";
import { SteamClientInfo } from "../models/SteamClientInfo";
import { EPersonaState } from "../models/EPersonaState";

export default class SteamClient {
    private steamUser: SteamUser;
    private startTime: number = 0;
    private _isRunning: boolean = false;
    private games: { [key: number]: string } = {};

    constructor() {
        this.steamUser = new SteamUser();

        this.steamUser.on('loggedOn', () => {
            log("Initializing Steam Client..");
            this.steamUser.setPersona(SteamUser.EPersonaState.Online);
            const shuffledGames = shuffleArray(Object.keys(this.games).map(key => Number(key)));
            this.steamUser.gamesPlayed(shuffledGames);
        });

        // @ts-ignore due to wrong typing in library
        this.steamUser.on('friendMessage', (steamID, message) => {
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
                    const uptime = getScriptUptime(this.startTime);
                    const gamesList = Object.entries(this.games)
                        .map(([id, name]) => `- ${name} (ID: ${id})`)
                        .join('\n');

                    return `Stats:\n- Time (GMT-3): ${timeGMT3}\n- Uptime: ${uptime}\n- Games Running:\n${gamesList}`;
                }
            };

            //Check if any interaction command is triggered in message
            const foundInteraction = Object.keys(interactionReplies).find(key => message.toLowerCase().includes(key));
            if (foundInteraction) {
                // @ts-ignore due to wrong typing in library
                this.steamUser.chatMessage(steamID, interactionReplies[foundInteraction]());
                return
            }

            // Check if any reply key is a substring of the message
            const foundKey = Object.keys(conversationReplies).find(key => message.toLowerCase().includes(key));

            if (foundKey) {
                // @ts-ignore due to wrong typing in library
                this.steamUser.chatMessage(steamID, conversationReplies[foundKey]);
            } else {
                // @ts-ignore due to wrong typing in library
                this.steamUser.chatMessage(steamID, "Fala ai fdp");
            }
        });

        this.steamUser.on('error', (err: any) => {
            switch (err.eresult) {
                case SteamUser.EResult.InvalidPassword:
                    log("Login Failed: Invalid Password.");
                    break;
                case SteamUser.EResult.AlreadyLoggedInElsewhere:
                    log("Login Failed: Already logged in elsewhere.");
                    break;
                case SteamUser.EResult.AccountLogonDenied:
                    log("Login Failed: Steam Guard required.");
                    break;
                default:
                    log(`Login Failed: ${err.message}`);
            }
        });
    }

    public start(username: string, password: string, otp: string, games: { [key: number]: string } = { 730: "Counter Striker 2" }) {
        this.games = games;

        this.steamUser.logOn({
            accountName: username,
            password: password,
            twoFactorCode: otp
        });

        this.startTime = Date.now();
        this._isRunning = true;
    }

    public stop() {
        this.steamUser.logOff();
        this.steamUser.once('disconnected', () => {
            log("Bot stopped successfully.");
            this.startTime = 0;
        });
        this._isRunning = false;
    }

    public async getInfo(): Promise<SteamClientInfo> {
        if (!this._isRunning) {
            return {
                name: '',
                games: {},
                status: '',
                startTime: 0
            }
        }
        
        const steamPerson = (await this.steamUser.getPersonas([this.steamUser.steamID!])).personas[this.steamUser.steamID!.toString()];

        return {
            name: this.steamUser.accountInfo!.name,
            games: this.games,
            status: EPersonaState[steamPerson.persona_state as keyof EPersonaState].toString(),
            startTime: this.startTime
        };
    }

    public isRunning(): boolean {
        return this._isRunning;
    }
}