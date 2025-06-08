import { useState, useEffect, useCallback } from 'react';
import { getAuthToken } from '@/lib/utils';

export interface FetchResult<T> {
  data: T;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetchWithFallback<T>(
  url: string,
  fallbackData: T,
  options?: RequestInit,
): FetchResult<T> {
  const [data, setData] = useState<T>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      const token = getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
      const json = (await res.json()) as T;
      setData(json);
    } catch (err) {
      console.error('Fetch failed:', err);
      setError(err as Error);
      setData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  }, [url, options, fallbackData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isError: Boolean(error),
    error,
    refetch: fetchData,
  };
}
