import { UUID } from "crypto";
import { Games } from "./Game";

export type SteamClientInfo = {
  id: UUID
  name: string;
  games: Games;
  status: string;
  startTime: number;
}