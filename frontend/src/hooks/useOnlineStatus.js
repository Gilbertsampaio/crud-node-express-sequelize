// src/hooks/useOnlineStatus.js
import { useEffect } from 'react';
import api from '../api/api'; // seu axios ou fetch configurado
import useAuth from '../context/useAuth';

export default function useOnlineStatus() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const ping = () => api.post('/users/ping').catch(console.error);

    // ping inicial
    ping();

    // ping a cada 60 segundos
    const interval = setInterval(ping, 10000);

    return () => clearInterval(interval);
  }, [user]);
}
