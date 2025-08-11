import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/services/api';
import { SteamClientInfo } from '@/types';

interface UseClientOptions {
  pollInterval?: number; // ms
  autoStart?: boolean;
}

export function useClient(clientId: string | undefined, options: UseClientOptions = {}) {
  const { pollInterval = 5000, autoStart = true } = options;
  const [client, setClient] = useState<SteamClientInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(!!clientId);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetchClient = useCallback(async () => {
    if (!clientId) return;
    try {
      setError(null);
      const data = await api.getClient(clientId);
      setClient(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !autoStart) return;
    setLoading(true);
    fetchClient();
  }, [clientId, autoStart, fetchClient]);

  useEffect(() => {
    if (!clientId) return;
    if (pollInterval <= 0) return;

    intervalRef.current = window.setInterval(() => {
      fetchClient();
    }, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [clientId, pollInterval, fetchClient]);

  return { client, loading, error, refetch: fetchClient };
}
