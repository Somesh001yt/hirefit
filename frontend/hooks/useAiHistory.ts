'use client';

import { useState, useEffect, useCallback } from 'react';
import { aiEndpoints, AiAnalysis } from '@/lib/endpoints';

export function useAiHistory(enabled: boolean = true) {
  const [data, setData] = useState<AiAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiEndpoints.history();
      setData(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail ?? 'Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) fetchHistory();
  }, [enabled, fetchHistory]);

  return { data, loading, error, refetch: fetchHistory };
}
