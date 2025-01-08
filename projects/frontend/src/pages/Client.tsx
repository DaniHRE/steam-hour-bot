import AppSidebar from '@/components/AppSidebar';
import { Container } from '@/components/Container';
import { Game, SteamClientInfo } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getGameIcons, getProfileInfo } from '@/utils';
import { Avatar } from '@/components/ui/avatar';

const CORS_PROXY = import.meta.env.VITE_CORS_PROXY;

import { useClientUptime } from '@/hooks/useClientUptime';

export default function Client() {
    const [client, setClient] = useState<SteamClientInfo | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [xmlResponse, setXmlResponse] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        setIsLoading(true);

        const fetchClient = fetch(`http://localhost:3000/client/${id}`, { method: 'GET' })
            .then((response) => response.json())
            .then((data) => {
                setClient(data);
                return data;
            });

        const fetchSteamProfile = fetchClient.then((clientData) => {
            if (clientData?.steamID) {
                return fetch(`${CORS_PROXY}https://steamcommunity.com/profiles/${clientData.steamID}/?xml=1`)
                    .then((response) => response.text())
                    .then((xml) => {
                        setXmlResponse(xml);
                    });
            }
        });

        const fetchGameIcons = fetchClient.then((clientData) => {
            if (clientData?.games) {
                return getGameIcons(clientData.games).then((icons) => {
                    setGames(icons);
                    console.log('Ícones dos jogos:', icons);
                });
            }
        });

        Promise.all([fetchClient, fetchSteamProfile, fetchGameIcons])
            .finally(() => {
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Erro em uma das requisições:', error);
                setIsLoading(false);
            });
    }, [id]);

    const uptime = useClientUptime(client?.startTime); // Hook que calcula o tempo de uptime

    if (isLoading) {
        return <p>Carregando dados do cliente...</p>;
    }

    return (
        <>
            <AppSidebar />
            <Container variant="breakpointPadded">
                <Card>
                    <CardHeader>
                        <Avatar>
                            <img src={getProfileInfo(xmlResponse)} alt={client!.name} />
                        </Avatar>
                        <CardTitle>{client!.name}</CardTitle>
                        <CardDescription>{client!.status}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>ID: {client!.id}</p>
                        <p>Start Time: {new Date(Date.now() - (Date.now() - client!.startTime)).toLocaleString(undefined, {
                            hour12: false,
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        })}</p>
                        <p>Uptime: {uptime}</p> {/* Exibe o uptime formatado */}
                        <p>Jogos Ativos:</p>
                        <ul>
                            {games.map(({ id, name, icon }) => (
                                <li key={id}>
                                    <img src={icon} alt={name} className="w-8 h-8 inline-block mr-2" />
                                    {name}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </Container>
        </>
    );
}