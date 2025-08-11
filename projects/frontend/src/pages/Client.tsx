import AppSidebar from '@/components/AppSidebar';
import { Container } from '@/components/Container';
import { Game } from '@/types';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useClient } from '@/hooks/useClient';
import { useClientUptime } from '@/hooks/useClientUptime';
import { steamGameService } from '@/services/steamGame';
import { useMemo } from 'react';

export default function Client() {
    const { id } = useParams<{ id: string }>();
    const { client, loading, error, refetch } = useClient(id, { pollInterval: 5000 });
    const uptime = useClientUptime(client?.startTime);

    const activeGames: Game[] = useMemo(() => {
        if (!client?.activeGames) return [];
        return Object.entries(client.activeGames).map(([appid, name]) => ({
            id: appid,
            name,
            icon: steamGameService.getGameIconUrl(appid)
        }));
    }, [client]);

    if (loading) {
        return (
            <>
                <AppSidebar />
                <Container variant="breakpointPadded">
                    <p>Carregando dados do cliente...</p>
                </Container>
            </>
        );
    }

    if (error || !client) {
        return (
            <>
                <AppSidebar />
                <Container variant="breakpointPadded">
                    <div className="space-y-4">
                        <p className="text-red-500">Erro ao carregar cliente: {error}</p>
                        <button onClick={refetch} className="underline text-sm">Tentar novamente</button>
                    </div>
                </Container>
            </>
        );
    }

    const isRunning = !!client.steamUser.id;

    return (
        <>
            <AppSidebar />
            <Container variant="breakpointPadded">
                <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar>
                            <img src={client.steamUser.avatar} alt={client.steamUser.name} />
                        </Avatar>
                        <div>
                            <CardTitle>{client.steamUser.name || `Client ${client.clientId.slice(0,8)}`}</CardTitle>
                            <CardDescription>Status: {client.status || 'offline'}</CardDescription>
                            {isRunning && <p className="text-sm mt-1">Uptime: {uptime}</p>}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p><span className="font-medium">Client ID:</span> {client.clientId}</p>
                        {isRunning ? (
                            <>
                                <p><span className="font-medium">Steam ID:</span> {client.steamUser.id}</p>
                                <p><span className="font-medium">Total de Horas (todos jogos):</span> {(client.steamUser.totalPlaytime / 60).toFixed(1)} h</p>
                            </>
                        ) : (
                            <p className="italic text-gray-500">Bot parado – sem informações de usuário.</p>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Jogos Ativos ({activeGames.length})</CardTitle>
                            <CardDescription>Jogos sendo farmados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {activeGames.length === 0 && <p className="text-sm text-gray-500">Nenhum jogo ativo.</p>}
                            <ul className="space-y-2 max-h-72 overflow-auto pr-2">
                                {activeGames.map(game => (
                                    <li key={game.id} className="flex items-center gap-3">
                                        <img src={game.icon} alt={game.name} className="w-10 h-10 rounded object-cover" />
                                        <span className="text-sm font-medium">{game.name} <span className="text-xs text-gray-500">(ID: {game.id})</span></span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Jogos Possuídos ({client.steamUser.ownedGames.length})</CardTitle>
                            <CardDescription>Biblioteca detectada</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(!isRunning || client.steamUser.ownedGames.length === 0) && <p className="text-sm text-gray-500">Sem dados – inicie o bot para carregar a biblioteca.</p>}
                            <ul className="space-y-2 max-h-72 overflow-auto pr-2">
                                {client.steamUser.ownedGames.slice(0, 100).map(game => (
                                    <li key={game.appid} className="flex items-center gap-3">
                                        <img src={steamGameService.getGameIconUrl(String(game.appid))} alt={game.name} className="w-10 h-10 rounded object-cover" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{game.name}</span>
                                            <span className="text-xs text-gray-500">{(game.playtime_forever/60).toFixed(1)} h</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </>
    );
}