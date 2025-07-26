import { UUID } from "crypto";
import { Games } from "./Game";

export type SteamGameAchievement = {
  title: string;
  description: string;
  unlocked: boolean;
  unlockTime?: string;
  image: string;
}

export type SteamOwnedGames = {
  appid: number;
  name: string;
  playtime_2weeks: number | null;
  playtime_forever: number;
  img_icon_url: string;
  img_logo_url: string;
  has_community_visible_stats: boolean;
  playtime_windows_forever: number;
  playtime_mac_forever: number;
  playtime_linux_forever: number;
  rtime_last_played: number;
  achievements: SteamGameAchievement[];
}

export type SteamClientInfo = {
  clientId: UUID;
  steamUser: {
    id: string;
    name: string;
    avatar: string;
    ownedGames: SteamOwnedGames[];
    totalPlaytime: number;
  }
  activeGames: Games;
  status: string;
  startTime: number;
}