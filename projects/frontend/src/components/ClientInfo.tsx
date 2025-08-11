import React, { useEffect, useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface ClientInfoProps {
    id: string;
    avatar: string;
    name: string;
    status: string;
    uptime: number;
    games: {
        logo: string;
        name: string;
    }[];
    onManageBot?: () => void;
    onDelete?: () => void;
};

const formatUptime = (uptime: number) => {
    const seconds = Math.floor((Date.now() - uptime) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours === 0 && minutes === 0) {
        return `${remainingSeconds}s`;
    }
    if (hours === 0) {
        return `${minutes}m ${remainingSeconds}s`;
    }

    return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'online':
            return 'text-green-500';
        case 'offline':
            return 'text-red-300';
        case 'busy':
            return 'text-yellow-500';
        default:
            return 'text-foreground';
    }
};

const ClientInfo: React.FC<ClientInfoProps> = ({ id, avatar, name, status, uptime: uptimeMs, games, onManageBot, onDelete }) => {
    const maxGamesToShow = 10;
    const safeGames = games ?? [];
    const additionalGamesCount = Math.max(0, safeGames.length - maxGamesToShow);
    const [uptime, setUptime] = useState(formatUptime(uptimeMs ?? 0));
    const statusLower = (status ?? 'offline').toLowerCase();

    useEffect(() => {
        const interval = setInterval(() => {
            setUptime(formatUptime(uptimeMs ?? 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [uptimeMs]);

    return (
        <div className='w-full max-w-md flex'>
            <Card className="w-full max-w-md p-4 flex flex-col border shadow-lg">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <img src={avatar || 'https://avatars.fastly.steamstatic.com/default_full.jpg'} className="text-gray-500 text-sm rounded-sm shadow-lg" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <CardTitle className={`text-lg line-clamp-1`} title={name || 'Cliente'}>{name || 'Cliente'}</CardTitle>
                                <CardDescription className={getStatusColor(statusLower)}> {status || 'offline'}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/client/${id}/dashboard`}>
                                        <span className="inline-flex items-center">
                                            <LayoutDashboard className="w-4 h-4 mr-1" />
                                            Dashboard
                                        </span>
                                    </Link>
                                </Button>
                                <Button size="sm" onClick={onManageBot}>
                                    <Settings className="w-4 h-4 mr-1" />
                                    Configurar
                                </Button>
                                {onDelete && (
                                    <Button size="sm" variant="destructive" onClick={onDelete}>Remover</Button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                        <span>{uptime}</span>
                    </div>
                </div>
                <p className="font-semibold mb-2 mt-4">Jogos Ativos:</p>
                <div className="flex gap-1 flex-wrap">
                    {safeGames.slice(0, maxGamesToShow).map((game, index) => (
                        <img
                            key={index}
                            className="w-8 h-8 bg-gray-200 rounded-md shadow-lg flex items-center justify-center text-xs text-gray-600"
                            src={game.logo}
                            alt={game.name}
                        />
                    ))}
                    {additionalGamesCount > 0 && (
                        <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-white">
                            +{additionalGamesCount}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ClientInfo;