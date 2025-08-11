'use client'

import { useState, useEffect } from 'react';
import AppSidebar from '@/components/AppSidebar';
import { Container } from '../components/Container';
import ClientInfo from '@/components/ClientInfo';
import { BotControlForm } from '@/components/BotControlForm';
import { Button } from '@/components/ui/button';
import { useClients } from '@/hooks/useClients';
import { SteamClientInfo, ClientInfo as ClientInfoType } from '@/types';
import { steamGameService } from '@/services/steamGame';

// Helper function to convert SteamClientInfo to ClientInfo format
const convertToClientInfo = (steamClient: SteamClientInfo): ClientInfoType => {
  const getGameIconUrl = (appId: string): string => {
    const ownedGame = steamClient.steamUser?.ownedGames?.find(game => game.appid.toString() === appId);
    if (ownedGame?.img_icon_url) {
      return ownedGame.img_icon_url;
    }
    return steamGameService.getGameIconUrl(appId);
  };

  const games = Object.entries(steamClient.activeGames || {}).map(([appId, gameName]) => ({
    logo: getGameIconUrl(appId),
    name: gameName,
  }));

  const hasSteamUser = !!steamClient.steamUser?.id;

  return {
    id: steamClient.clientId,
    avatar: steamClient.steamUser?.avatar || 'https://avatars.fastly.steamstatic.com/default_full.jpg',
    name: hasSteamUser ? (steamClient.steamUser?.name || `Client ${steamClient.clientId.slice(0, 8)}`) : `Client ${steamClient.clientId.slice(0, 8)}`,
    status: steamClient.status || (hasSteamUser ? 'online' : 'offline'),
    uptime: hasSteamUser ? steamClient.startTime : 0,
    games,
  };
};

export default function Home() {
    const [showBotForm, setShowBotForm] = useState<string | null>(null);
    const { clients, loading, error, createClient, deleteClient } = useClients();
    
    const handleCreateClient = async () => {
        try {
            const result = await createClient();
            alert(`Cliente criado com ID: ${result.clientId}`);
        } catch (error) {
            alert(`Erro ao criar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
            try {
                await deleteClient(clientId);
                alert('Cliente deletado com sucesso!');
            } catch (error) {
                alert(`Erro ao deletar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            }
        }
    };

    if (loading) {
        return (
            <>
                <AppSidebar />
                <Container variant="breakpointPadded">
                    <p>Carregando...</p>
                </Container>
            </>
        );
    }

    if (error) {
        return (
            <>
                <AppSidebar />
                <Container variant="breakpointPadded">
                    <p className="text-red-500">Erro: {error}</p>
                </Container>
            </>
        );
    }

    const convertedClients = clients.map(convertToClientInfo);

    return (
        <>
            <AppSidebar />
            <Container variant="breakpointPadded">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Steam Hour Bot Dashboard</h1>
                        <p className="text-muted-foreground">
                            Gerencie seus bots Steam e monitore seus jogos
                        </p>
                    </div>
                    <Button onClick={handleCreateClient}>
                        Criar novo cliente
                    </Button>
                </div>

                {convertedClients.length === 0 ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
                        <p className="text-muted-foreground mb-4">
                            Crie seu primeiro cliente Steam para começar
                        </p>
                        <Button onClick={handleCreateClient}>
                            Criar primeiro cliente
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {convertedClients.map((client) => (
                            <div key={client.id} className="relative">
                                <ClientInfo
                                    {...client}
                                    onDelete={() => handleDeleteClient(client.id)}
                                    onManageBot={() => setShowBotForm(client.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {showBotForm && (
                    <BotControlForm
                        clientId={showBotForm}
                        onClose={() => setShowBotForm(null)}
                    />
                )}
            </Container>
        </>
    );
}
