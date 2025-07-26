import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SteamClientInfo } from '../types';

export const useClients = () => {
  const [clients, setClients] = useState<SteamClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const clientsData = await api.getAllClients();
      setClients(clientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async () => {
    try {
      const result = await api.createClient();
      await fetchClients(); // Refresh the list
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
      throw err;
    }
  };

  const deleteClient = async (clientId: string) => {
    try {
      await api.deleteClient(clientId);
      await fetchClients(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
      throw err;
    }
  };

  const startBot = async (
    clientId: string, 
    username: string, 
    password: string, 
    otp: string, 
    gamesId: number[]
  ) => {
    try {
      const result = await api.startBot(clientId, username, password, otp, gamesId);
      await fetchClients(); // Refresh to get updated status
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start bot');
      throw err;
    }
  };

  const stopBot = async (clientId: string) => {
    try {
      const result = await api.stopBot(clientId);
      await fetchClients(); // Refresh to get updated status
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop bot');
      throw err;
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient,
    deleteClient,
    startBot,
    stopBot,
  };
};
