// Steam Game Service - for fetching game information

interface GameData {
  appId: string;
  name: string;
  headerImage: string;
  icon: string;
}

export const steamGameService = {
  // Cache for game data to avoid repeated requests
  gameCache: new Map<string, GameData>(),

  // Get game details from Steam Store API
  async getGameDetails(appId: string): Promise<GameData> {
    if (this.gameCache.has(appId)) {
      return this.gameCache.get(appId)!;
    }

    try {
      const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`);
      const data = await response.json();
      
      if (data[appId]?.success && data[appId]?.data) {
        const gameData: GameData = {
          appId,
          name: data[appId].data.name,
          headerImage: data[appId].data.header_image,
          icon: data[appId].data.header_image, // Use header image as icon
        };
        
        this.gameCache.set(appId, gameData);
        return gameData;
      }
    } catch (error) {
      console.error(`Error fetching game details for ${appId}:`, error);
    }

    // Fallback data
    const fallback: GameData = {
      appId,
      name: `Game ${appId}`,
      headerImage: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg`,
      icon: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg`,
    };
    
    this.gameCache.set(appId, fallback);
    return fallback;
  },

  // Get game icon URL - simpler version for immediate use
  getGameIconUrl(appId: string): string {
    return `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg`;
  }
};
