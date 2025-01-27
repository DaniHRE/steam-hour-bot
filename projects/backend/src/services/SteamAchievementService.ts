import axios from "axios";
import * as cheerio from 'cheerio';

interface Achievement {
    title: string;
    description: string;
    unlocked: boolean;
    unlockTime?: string;
    image: string;
}

export async function getSteamAchievements(steamId: string, appId: number): Promise<Achievement[]> {
    const url = `https://steamcommunity.com/profiles/${steamId}/stats/${appId}/?tab=achievements`;

    if (!steamId || !appId) {
        throw new Error("Steam ID and App ID are required.");
    }

    try {
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        const achievements: Achievement[] = [];

        // Iterate over achievements
        $('.achieveRow').each((_, element) => {
            const title = $(element).find('.achieveTxt h3').text().trim();
            const description = $(element).find('.achieveTxt h5').first().text().trim();
            const unlockTime = $(element).find('.achieveUnlockTime').text().trim();
            const unlocked = !!unlockTime; // If `achieveUnlockTime` has no text, it is unlocked
            const image = $(element).find('.achieveImgHolder img').attr('src') || '';

            achievements.push({ title, description, unlocked, unlockTime: unlocked ? unlockTime : undefined, image });
        });

        return achievements;

    } catch (error) {
        console.error('Error fetching achievements:', error);
        throw error;
    }
}