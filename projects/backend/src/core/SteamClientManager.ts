import { randomUUID, UUID } from "crypto";
import { SteamClientInfo } from "../models/SteamClientInfo";
import SteamClient from "./SteamClient";

export default class SteamClientManager {
    private steamClients: { [key: string]: SteamClient } = {};

    constructor() {

    }

    public async getAllClients(): Promise<Array<SteamClientInfo>> { 
        return Promise.all(Object.values(this.steamClients).map(client => client.getInfo()));
    }

    public createClient(): string {
        const clientId = randomUUID();
        this.steamClients[clientId] = new SteamClient(clientId);
        return clientId;
    }

    public destroyClient(clientId: UUID): void {
        const client = this.steamClients[clientId];

        if (client.isRunning()) {
            client.stop();
        }

        delete this.steamClients[clientId];
    }

    public getClient(clientId: string): SteamClient | null {
        return this.steamClients[clientId] || null;
    }
}