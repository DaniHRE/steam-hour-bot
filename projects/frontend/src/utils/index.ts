import { Game, GamesId } from '@/types';
import * as cheerio from 'cheerio';

const CORS_PROXY=import.meta.env.VITE_CORS_PROXY;

function parseXMLToObject(xmlString: string): Document {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
        throw new Error("Erro ao parsear o XML: " + parseError.textContent);
    }

    return xmlDoc;
}

export function getProfileInfo(xmlString: string): string {
    const xmlDoc = parseXMLToObject(xmlString);

    const steamID = xmlDoc.getElementsByTagName("steamID")[0]?.textContent || "";
    const avatarFull = xmlDoc.getElementsByTagName("avatarFull")[0]?.textContent || "";

    if (!steamID || !avatarFull) {
        throw new Error("Elementos 'steamID' ou 'avatarFull' não encontrados.");
    }

    return avatarFull;
}

export async function getGameIcons(gamesId: GamesId): Promise<Game[]> {
    const games: Game[] = [];

    try {
        for (const [appId, name] of Object.entries<string>(gamesId)) {
            const url = `${CORS_PROXY}https://store.steampowered.com/app/${appId}`;
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Erro ao acessar a página: ${response.statusText}`);
                continue;
            }
    
            const html = await response.text();
            
            const $ = cheerio.load(html);
    
            const iconElement = $('.apphub_AppIcon img');
            const iconUrl = iconElement.attr('src');
    
            if (iconUrl) {
                console.log(`Ícone encontrado: ${iconUrl}`);
                games.push({id: appId, name, icon: iconUrl});
            } else {
                console.error("Ícone não encontrado na página.");
                continue;
            }
        }
    } catch (error) {
        console.error(`Erro ao buscar o ícone: ${(error as Error).message}`);
    }
    return games;
}