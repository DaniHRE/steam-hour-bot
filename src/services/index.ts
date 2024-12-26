import axios from "axios";
import { log } from "../utils";

// Function to fetch game names from Steam Store
export const fetchGameNames = async (gameIds: number[]): Promise<{ [key: number]: string }> => {
    const gameNames: { [key: number]: string } = {};
    const baseUrl = "https://store.steampowered.com/api/appdetails?appids=";

    for (const gameId of gameIds) {
        try {
            const url = `${baseUrl}${gameId}`;
            const response = await axios.get(url);

            if (response.status === 200) {
                // Acessa a propriedade dinamicamente usando o gameId
                const gameData = response.data[gameId]?.data;
                if (gameData) {
                    gameNames[gameId] = gameData.name; // Assume que 'name' é o nome do jogo
                } else {
                    gameNames[gameId] = `Unknown Game (ID: ${gameId})`;
                }
            } else {
                gameNames[gameId] = `Unknown Game (ID: ${gameId})`;
            }
        } catch (error) {
            gameNames[gameId] = `Error fetching game (ID: ${gameId})`;
        }
    }

    log("Game data loaded");
    return gameNames;
};