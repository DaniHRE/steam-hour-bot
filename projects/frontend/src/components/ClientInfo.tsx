import React, { useEffect, useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';

interface ClientInfoProps {
    client: {
        avatar: string;
        name: string;
        status: string;
        uptime: number;
        games: {
            logo: string;
            name: string;
        }[];
    };
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

const ClientInfo: React.FC<ClientInfoProps> = ({ client }) => {
    const maxGamesToShow = 10;
    const additionalGamesCount = client.games.length - maxGamesToShow;
    const [uptime, setUptime] = useState(formatUptime(client.uptime));

    useEffect(() => {
        const interval = setInterval(() => {
            setUptime(formatUptime(client.uptime));
        }, 1000);

        return () => clearInterval(interval);
    }, [client.uptime]);

    return (
    <Card className="w-full max-w-md p-4 flex flex-col border shadow-lg">
        <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                <img src={client.avatar} className="text-gray-500 text-sm rounded-sm shadow-lg"></img>
            </div>
            <div className="flex-1">
                <CardTitle className={`text-lg line-clamp-1 `} title={client.name}>{client.name}</CardTitle>
                <CardDescription className={getStatusColor(client.status.toLocaleLowerCase())}> {client.status}</CardDescription>
            </div>
            <div className="text-sm text-gray-500">
                <span>{uptime}</span>
            </div>
        </div>
        <p className="font-semibold mb-2 mt-4">Jogos Ativos:</p>
        <div className="flex gap-1">
            {client.games.slice(0, maxGamesToShow).map((game, index) => (
                <img
                    key={index}
                    className="w-8 h-8 bg-gray-200 rounded-md shadow-lg flex items-center justify-center text-xs text-gray-600"
                    src={game.logo}
                    alt={game.name}
                >
                </img>
            ))}
            {additionalGamesCount > 0 && (
                <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-white">
                    +{additionalGamesCount}
                </div>
            )}
        </div>
    </Card>
    );
};

export default ClientInfo;