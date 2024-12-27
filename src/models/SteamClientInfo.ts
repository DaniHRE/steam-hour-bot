import { Games } from "./Game";

export type SteamClientInfo = {
  name: string;
  games: Games;
  status: string;
  startTime: number;
}