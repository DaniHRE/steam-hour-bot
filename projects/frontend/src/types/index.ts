import { UUID } from "crypto";

export type Games = {
    [key: number]: string;
}

export type SteamClientInfo = {
    id: UUID
    name: string;
    games: Games;
    status: string;
    startTime: number;
  }