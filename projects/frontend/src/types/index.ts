import { UUID } from "crypto";

export type Game = {
    id: string;
    name: string;
    icon: string;
}

export type GamesId = {
    [key: number]: string;
}

export type SteamClientInfo = {
    id: UUID;
    steamID: string;
    name: string;
    games: GamesId;
    status: string;
    startTime: number;
  }