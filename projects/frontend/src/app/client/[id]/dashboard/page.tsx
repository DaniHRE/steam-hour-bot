'use client'

import AppSidebar from '@/components/AppSidebar';
import { Container } from '@/components/Container';
import { Game, SteamOwnedGames } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { useClient } from '@/hooks/useClient';
import { useClientUptime } from '@/hooks/useClientUptime';
import { steamGameService } from '@/services/steamGame';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';

export default function ClientPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const { client, loading, error, refetch } = useClient(id, { pollInterval: 5000 });
    const uptime = useClientUptime(client?.startTime);

    // Build a map of owned games by appid for quick lookup
    const ownedGamesMap = useMemo(() => {
        const map = new Map<string, SteamOwnedGames>();
        const owned = client?.steamUser?.ownedGames ?? [];
        for (const g of owned) {
            map.set(String(g.appid), g);
        }
        return map;
    }, [client?.steamUser?.ownedGames]);

    const activeGames: Game[] = useMemo(() => {
        if (!client?.activeGames) return [];
        return Object.entries(client.activeGames).map(([appid, activeName]) => {
            const owned = ownedGamesMap.get(String(appid));
            const icon = owned?.img_icon_url || steamGameService.getGameIconUrl(String(appid));
            return {
                id: String(appid),
                name: activeName || owned?.name || `App ${appid}`,
                icon,
            };
        });
    }, [client?.activeGames, ownedGamesMap]);

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

    const hasSteamUser = !!client.steamUser?.id;

    return (
        <>
            <AppSidebar />
            <Container variant="breakpointPadded">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Dashboard do Cliente
                            </h1>
                            <p className="text-muted-foreground">
                                ID: {client.clientId}
                            </p>
                        </div>
                        <button
                            onClick={refetch}
                            className="text-sm text-muted-foreground hover:text-foreground underline"
                        >
                            Atualizar dados
                        </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Client Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Status do Cliente</CardTitle>
                                <CardDescription>
                                    Informações gerais do cliente Steam
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="w-12 h-12">
                                        <img
                                            src={client.steamUser?.avatar || 'https://avatars.fastly.steamstatic.com/default_full.jpg'}
                                            alt="Avatar"
                                        />
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">
                                            {hasSteamUser
                                                ? (client.steamUser?.name || `Cliente ${client.clientId.slice(0, 8)}`)
                                                : `Cliente ${client.clientId.slice(0, 8)}`
                                            }
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Status: {client.status || (hasSteamUser ? 'online' : 'offline')}
                                        </p>
                                    </div>
                                </div>
                                {hasSteamUser && (
                                    <div>
                                        <p className="text-sm font-medium">Tempo online:</p>
                                        <p className="text-sm text-muted-foreground">{uptime}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Steam User Info Card */}
                        {hasSteamUser && client.steamUser && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Steam</CardTitle>
                                    <CardDescription>
                                        Dados do usuário Steam conectado
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium">Steam ID:</p>
                                        <p className="text-sm text-muted-foreground font-mono">{client.steamUser.id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Nome de usuário:</p>
                                        <p className="text-sm text-muted-foreground">{client.steamUser.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Jogos na biblioteca:</p>
                                        <p className="text-sm text-muted-foreground">
                                            {client.steamUser.ownedGames?.length || 0} jogos
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Active Games Card */}
                        <Card className={hasSteamUser ? "md:col-span-2 lg:col-span-1" : "md:col-span-1"}>
                            <CardHeader>
                                <CardTitle>Jogos Ativos</CardTitle>
                                <CardDescription>
                                    Jogos sendo farmados atualmente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {activeGames.length > 0 ? (
                                    <div className="space-y-3">
                                        {activeGames.map((game) => (
                                            <div key={game.id} className="flex items-center space-x-3">
                                                <img
                                                    src={game.icon}
                                                    alt={game.name}
                                                    className="w-8 h-8 rounded"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/32x32?text=?';
                                                    }}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium">{game.name}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {game.id}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Nenhum jogo sendo farmado no momento
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Container>
        </>
    );
}
