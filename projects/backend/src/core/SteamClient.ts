import SteamUser from "steam-user";
import { log } from "../utils";
import { getScriptUptime, getTimeInGMT3, shuffleArray } from "../utils";
import { SteamClientInfo } from "../models/SteamClientInfo";
import { EPersonaState } from "../models/EPersonaState";
import defaultReplies from "../config/defaultReplies.json";
import { UUID } from "crypto";

export default class SteamClient {
    private steamUser: SteamUser;
    private startTime: number = 0;
    private _isRunning: boolean = false;
    private games: { [key: number]: string } = {};

    constructor(private id: UUID) {
        this.steamUser = new SteamUser();

        this.steamUser.on('loggedOn', () => {
            log("Initializing Steam Client...");
            this.steamUser.setPersona(SteamUser.EPersonaState.Online);
            const shuffledGames = shuffleArray(Object.keys(this.games).map(key => Number(key)));
            this.steamUser.gamesPlayed(shuffledGames);
            log("Steam Client initialized successfully");
            this.startTime = Date.now();
            this._isRunning = true;
        });

        // @ts-ignore due to wrong typing in library
        this.steamUser.on('friendMessage', (steamID, message) => {
            const conversationReplies: { [key: string]: string } = defaultReplies;

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
                return
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
                case SteamUser.EResult.LoggedInElsewhere:
                    log("Login Failed: Logged in elsewhere.");
                    break;
                case SteamUser.EResult.AccountLogonDenied:
                    log("Login Failed: Steam Guard required.");
                    break;
                default:
                    log(`Login Failed: ${err.message}`);
            }
        });
    }

    public start(username: string, password: string, otp: string, games: { [key: number]: string } = { 730: "Counter Striker 2" }): boolean {
        if (this._isRunning) return false;

        this.games = games;

        this.steamUser.logOn({
            accountName: username,
            password: password,
            twoFactorCode: otp
        });

        return true;
    }

    public stop(): boolean {
        if (!this._isRunning) return false;

        this.steamUser.logOff();
        this.steamUser.once('disconnected', () => {
            log("Bot stopped successfully.");
            this.startTime = 0;
        });
        this._isRunning = false;

        return true;
    }

    public getInfo(): SteamClientInfo {
        if (!this._isRunning || !this.steamUser.steamID) {
            return {
                id: this.id,
                name: '',
                games: {},
                status: '',
                startTime: 0
            }
        }

        const steamPerson = this.steamUser.users[this.steamUser.steamID!.toString()];

        if (!steamPerson) {
            return {
                id: this.id,
                name: this.steamUser.accountInfo!.name,
                games: this.games,
                status: EPersonaState["0"],
                startTime: this.startTime
            }
        }

        return {
            id: this.id,
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