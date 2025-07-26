import { useState } from 'react';
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
  // Function to get game icon URL using only the app ID
  const getGameIconUrl = (appId: string): string => {
    // Try to find the game in owned games first to get the specific icon
    const ownedGame = steamClient.steamUser?.ownedGames?.find(game => game.appid.toString() === appId);
    
    if (ownedGame?.img_icon_url) {
      // If we have the specific icon URL, use it
      return ownedGame.img_icon_url;
    }
    
    // Fallback: use Steam's header image which always exists
    return steamGameService.getGameIconUrl(appId);
  };

  // Get game icons from active games
  const games = Object.entries(steamClient.activeGames || {}).map(([appId, gameName]) => {
    const iconUrl = getGameIconUrl(appId);
    
    return {
      logo: iconUrl,
      name: gameName,
    };
  });

  return {
    id: steamClient.clientId,
    avatar: steamClient.steamUser?.avatar || 'https://avatars.fastly.steamstatic.com/default_full.jpg',
    name: steamClient.steamUser?.name || `Client ${steamClient.clientId.slice(0, 8)}`,
    status: steamClient.status,
    uptime: steamClient.startTime,
    games,
  };
};

export const Home = () => {
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
        if (confirm('Tem certeza que deseja deletar este cliente?')) {
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
                <Container variant="breakpointPadded" className=''>
                    <div className="flex items-center justify-center h-64">
                        <p>Carregando clientes...</p>
                    </div>
                </Container>
            </>
        );
    }

    if (error) {
        return (
            <>
                <AppSidebar />
                <Container variant="breakpointPadded" className=''>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">Erro ao carregar clientes: {error}</p>
                            <Button onClick={() => window.location.reload()}>
                                Tentar Novamente
                            </Button>
                        </div>
                    </div>
                </Container>
            </>
        );
    }

    return (
        <>
            <AppSidebar />
            <Container variant="breakpointPadded" className=''>
                <div className="flex justify-between items-center">
                    <h1 className="scroll-m-20 text-lg font-extrabold tracking-tight lg:text-5xl md:text-3xl lg:pt-6 md:pt-6 pt-8">
                        Clients ({clients.length})
                    </h1>
                    <Button onClick={handleCreateClient} className="mt-6">
                        Criar Novo Cliente
                    </Button>
                </div>
                
                {clients.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">Nenhum cliente encontrado</p>
                        <Button onClick={handleCreateClient}>
                            Criar Primeiro Cliente
                        </Button>
                    </div>
                ) : (
                    <div className='flex flex-wrap max-w-full w-full h-full mt-4 gap-4'>
                        {clients.map((steamClient) => {
                            const clientInfo = convertToClientInfo(steamClient);
                            return (
                                <div key={steamClient.clientId} className="relative">
                                    <ClientInfo client={clientInfo} />
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => setShowBotForm(steamClient.clientId)}
                                        >
                                            Controlar
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="destructive"
                                            onClick={() => handleDeleteClient(steamClient.clientId)}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bot Control Form Modal */}
                {showBotForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg">
                            <BotControlForm 
                                clientId={showBotForm}
                                onSuccess={() => setShowBotForm(null)}
                            />
                            <Button 
                                variant="outline" 
                                onClick={() => setShowBotForm(null)}
                                className="mt-4 w-full"
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                )}
            </Container>
        </>
    );
};
