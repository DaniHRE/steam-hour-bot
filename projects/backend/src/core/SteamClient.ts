import SteamUser from "steam-user";
import { log } from "../utils";
import { getScriptUptime, getTimeInGMT3, shuffleArray } from "../utils";
import { SteamClientInfo, SteamOwnedGames } from "../models/SteamClientInfo";
import { EPersonaState } from "../models/EPersonaState";
import defaultReplies from "../config/defaultReplies.json";
import { UUID } from "crypto";
import { getSteamAchievements } from "../services/SteamAchievementService";

export default class SteamClient {
    private steamUser: SteamUser;
    private startTime: number = 0;
    private _isRunning: boolean = false;
    private games: { [key: number]: string } = {};
    private achievements: { [key: number]: any[] } = {};

    constructor(private id: UUID) {
        this.steamUser = new SteamUser({
            enablePicsCache: true
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
    }

    public async start(username: string, password: string, otp: string, games: { [key: number]: string } = { 730: "Counter Striker 2" }): Promise<{ success: boolean; error?: string }> {
        if (this._isRunning) {
            return { success: false, error: "Bot is already running." };
        }

        this.games = games;

        // Create a promise to handle the login process
        return new Promise((resolve) => {
            // Set up temporary event listeners for this login attempt
            const onLoggedOn = async () => {
                try {
                    // Get user's owned games to validate
                    const ownedGames = await this.steamUser.getUserOwnedApps(this.steamUser.steamID!.toString()) as unknown as { apps: SteamOwnedGames[] };
                    
                    // Check if user owns all the games they want to farm
                    const gameIds = Object.keys(games).map(id => parseInt(id));
                    const ownedGameIds = ownedGames.apps.map(game => game.appid);
                    
                    const unownedGames = gameIds.filter(gameId => !ownedGameIds.includes(gameId));
                    
                    if (unownedGames.length > 0) {
                        // User doesn't own some games, stop the client
                        this.steamUser.logOff();
                        this._isRunning = false;
                        
                        const unownedGameNames = unownedGames.map(id => games[id] || `Game ${id}`).join(', ');
                        resolve({ 
                            success: false, 
                            error: `You don't own the following games: ${unownedGameNames}. You can only farm hours for games you own.`
                        });
                        return;
                    }

                    // User owns all games, proceed with initialization
                    log("Initializing Steam Client...");
                    this.steamUser.setPersona(SteamUser.EPersonaState.Online);
                    const shuffledGames = shuffleArray(Object.keys(this.games).map(key => Number(key)));
                    this.steamUser.gamesPlayed(shuffledGames);

                    const steamID = this.steamUser.steamID!.toString();
                    const achievementPromises = Object.keys(this.games).map(async (gameId) => {
                        try {
                            const achievements = await getSteamAchievements(steamID, Number(gameId));
                            this.achievements[Number(gameId)] = achievements;
                        } catch (error) {
                            console.error(`Error fetching achievements for game ${gameId}:`, error);
                            this.achievements[Number(gameId)] = [];
                        }
                    });

                    await Promise.all(achievementPromises);

                    log("Steam Client initialized successfully");
                    this.startTime = Date.now();
                    this._isRunning = true;
                    
                    resolve({ success: true });
                } catch (error) {
                    this.steamUser.logOff();
                    this._isRunning = false;
                    resolve({ 
                        success: false, 
                        error: `Failed to validate games: ${error instanceof Error ? error.message : 'Unknown error'}`
                    });
                }
                
                // Clean up event listeners
                this.steamUser.removeListener('loggedOn', onLoggedOn);
                this.steamUser.removeListener('error', onError);
            };

            const onError = (err: any) => {
                let errorMessage = "Login failed";
                switch (err.eresult) {
                    case SteamUser.EResult.InvalidPassword:
                        errorMessage = "Invalid password";
                        break;
                    case SteamUser.EResult.AlreadyLoggedInElsewhere:
                        errorMessage = "Already logged in elsewhere";
                        break;
                    case SteamUser.EResult.LoggedInElsewhere:
                        errorMessage = "Logged in elsewhere";
                        break;
                    case SteamUser.EResult.AccountLogonDenied:
                        errorMessage = "Steam Guard required or invalid";
                        break;
                    default:
                        errorMessage = err.message || "Unknown login error";
                }
                
                resolve({ success: false, error: errorMessage });
                
                // Clean up event listeners
                this.steamUser.removeListener('loggedOn', onLoggedOn);
                this.steamUser.removeListener('error', onError);
            };

            // Set up event listeners
            this.steamUser.once('loggedOn', onLoggedOn);
            this.steamUser.once('error', onError);

            // Attempt login
            this.steamUser.logOn({
                accountName: username,
                password: password,
                twoFactorCode: otp
            });
        });
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

    public async getInfo(): Promise<SteamClientInfo> {
        if (!this._isRunning || !this.steamUser.steamID) {
            return {
                clientId: this.id,
                steamUser: {
                    id: '',
                    name: '',
                    avatar: '',
                    ownedGames: [],
                    totalPlaytime: 0
                },
                activeGames: {},
                status: '',
                startTime: 0
            }
        }

        const steamPerson = this.steamUser.users[this.steamUser.steamID!.toString()];
        // Wrapping and converting types due library doesn't have a proper typing
        const ownedGames = await this.steamUser.getUserOwnedApps(this.steamUser.steamID!.toString()) as unknown as { apps: SteamOwnedGames[] };

        if (!steamPerson || ownedGames.apps.length === 0) {
            const defaultAvatar = 'https://avatars.fastly.steamstatic.com/default_full.jpg';
            const userAvatar = steamPerson?.avatar_url_full || defaultAvatar;
            
            return {
                clientId: this.id,
                steamUser: {
                    id: this.steamUser.steamID!.toString(),
                    name: this.steamUser.accountInfo?.name!,
                    avatar: userAvatar,
                    ownedGames: ownedGames.apps.map(game => ({
                        appid: game.appid,
                        name: game.name,
                        playtime_2weeks: game.playtime_2weeks || 0,
                        playtime_forever: game.playtime_forever,
                        img_icon_url: game.img_icon_url,
                        img_logo_url: game.img_logo_url,
                        has_community_visible_stats: game.has_community_visible_stats,
                        playtime_windows_forever: game.playtime_windows_forever,
                        playtime_mac_forever: game.playtime_mac_forever,
                        playtime_linux_forever: game.playtime_linux_forever,
                        rtime_last_played: game.rtime_last_played,
                        achievements: game.achievements
                    })),
                    totalPlaytime: ownedGames.apps.reduce((acc, game) => acc + game.playtime_forever, 0)
                },
                activeGames: this.games,
                status: EPersonaState["0"],
                startTime: this.startTime
            }
        }

        const defaultAvatar = 'https://avatars.fastly.steamstatic.com/default_full.jpg';
        const userAvatar = steamPerson?.avatar_url_full || defaultAvatar;

        return {
            clientId: this.id,
            steamUser: {
                id: this.steamUser.steamID!.toString(),
                name: this.steamUser.accountInfo?.name!,
                avatar: userAvatar,
                ownedGames: ownedGames.apps.map(game => ({
                    appid: game.appid,
                    name: game.name,
                    playtime_2weeks: game.playtime_2weeks || 0,
                    playtime_forever: game.playtime_forever,
                    img_icon_url: game.img_icon_url,
                    img_logo_url: game.img_logo_url,
                    has_community_visible_stats: game.has_community_visible_stats,
                    playtime_windows_forever: game.playtime_windows_forever,
                    playtime_mac_forever: game.playtime_mac_forever,
                    playtime_linux_forever: game.playtime_linux_forever,
                    rtime_last_played: game.rtime_last_played,
                    achievements: this.achievements[game.appid] || []
                })),
                totalPlaytime: ownedGames.apps.reduce((acc, game) => acc + game.playtime_forever, 0)
            },
            activeGames: this.games,
            status: EPersonaState[steamPerson.persona_state as keyof EPersonaState].toString(),
            startTime: this.startTime
        }
    }

    public isRunning(): boolean {
        return this._isRunning;
    }
}