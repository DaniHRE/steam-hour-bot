import { SteamClientInfo } from '@/types';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function Client() {
    const [client, setClient] = useState<SteamClientInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        setIsLoading(true);
        fetch(`http://localhost:3000/client/${id}`, { method: 'GET' }).then(
            response => response.json().then(data => {
                setIsLoading(false);
                setClient(data);
            }).catch(error => {
                setIsLoading(false);
                console.error('Error:', error);
            }
            )
        )
    }, []);

    if (isLoading) {
        return <p>Carregando dados do cliente...</p>;
    }

    return (
        <div>
            <h1>Client</h1>
            <p>{client!.id}</p>
            <p>{client!.name}</p>
            <p>{client!.status}</p>
            <p>{client!.startTime}</p>
            <p>{JSON.stringify(client!.games)}</p>
        </div>
    );
}