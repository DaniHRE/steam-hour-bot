import { SteamClientInfo } from "../models/SteamClientInfo";
import SteamClient from "./SteamClient";

export default class SteamClientManager {
    private steamClients: { [key: string]: SteamClient } = {};

    constructor() {

    }

    public getAllClients(): Array<SteamClientInfo> { 
        return Object.values(this.steamClients).map(client => client.getInfo());
    }

    public createClient(clientName: string): void {
        this.steamClients[clientName] = new SteamClient();
    }

    public destroyClient(clientName: string): void {
        const client = this.steamClients[clientName];

        if (client.isRunning()) {
            client.stop();
        }

        delete this.steamClients[clientName];
    }

    public getClient(clientName: string): SteamClient | null {
        return this.steamClients[clientName] || null;
    }
}