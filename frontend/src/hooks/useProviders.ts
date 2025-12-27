import { useState, useEffect } from 'react';
import type { ProviderInfo } from '../types';
import * as api from '../services/api';

export function useProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await api.getAvailableProviders();
        setProviders(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch providers');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  return { providers, loading, error };
}
