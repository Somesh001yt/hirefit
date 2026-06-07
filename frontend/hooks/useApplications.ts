'use client';

import { useState, useEffect, useCallback } from 'react';
import { applicationEndpoints, Application, ApplicationPayload } from '@/lib/endpoints';

export function useApplications(statusFilter?: string) {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await applicationEndpoints.list(statusFilter);
      setData(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err.response?.data?.detail ?? 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const create = async (payload: ApplicationPayload): Promise<Application> => {
    const res = await applicationEndpoints.create(payload);
    setData((prev) => [res.data, ...prev]);
    return res.data;
  };

  const update = async (
    id: string,
    payload: Partial<ApplicationPayload>
  ): Promise<Application> => {
    const res = await applicationEndpoints.update(id, payload);
    setData((prev) => prev.map((a) => (a.id === id ? res.data : a)));
    return res.data;
  };

  const remove = async (id: string): Promise<void> => {
    await applicationEndpoints.delete(id);
    setData((prev) => prev.filter((a) => a.id !== id));
  };

  return { data, loading, error, create, update, remove, refetch: fetchApplications };
}
