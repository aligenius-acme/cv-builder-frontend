import { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

interface UseFetchDataOptions<T> {
  /**
   * The API function to call. Should return a response with { success: boolean, data?: T }
   */
  fetchFn: () => Promise<{ success: boolean; data?: T }>;

  /**
   * Error message to show in toast if fetch fails
   * @default 'Failed to load data'
   */
  errorMessage?: string;

  /**
   * Whether to show error toast on failure
   * @default true
   */
  showErrorToast?: boolean;

  /**
   * Whether to fetch data immediately on mount
   * @default true
   */
  immediate?: boolean;

  /**
   * Callback to run on successful fetch
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback to run on fetch error
   */
  onError?: (error: any) => void;

  /**
   * Dependencies array for refetching when values change
   */
  deps?: any[];
}

interface UseFetchDataReturn<T> {
  /**
   * The fetched data
   */
  data: T | null;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error object if fetch failed
   */
  error: Error | null;

  /**
   * Manual refetch function
   */
  refetch: () => Promise<void>;

  /**
   * Set data manually (useful for optimistic updates)
   */
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Custom hook for data fetching with loading, error handling, and refetch capabilities
 *
 * @example
 * ```tsx
 * const { data: resumes, isLoading, error, refetch } = useFetchData({
 *   fetchFn: () => api.getResumes(),
 *   errorMessage: 'Failed to load resumes',
 * });
 * ```
 */
export function useFetchData<T>({
  fetchFn,
  errorMessage = 'Failed to load data',
  showErrorToast = true,
  immediate = true,
  onSuccess,
  onError,
  deps = [],
}: UseFetchDataOptions<T>): UseFetchDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchFn();

      if (response.success && response.data) {
        setData(response.data as T);
        onSuccess?.(response.data as T);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);

      if (showErrorToast) {
        toast.error(getErrorMessage(err, errorMessage));
      }

      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, errorMessage, showErrorToast, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [...deps, immediate]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData,
  };
}

/**
 * Variant for fetching multiple data sources in parallel
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useFetchMultiple([
 *   () => api.getResumes(),
 *   () => api.getCoverLetters(),
 * ]);
 * ```
 */
export function useFetchMultiple<T extends any[]>(
  fetchFns: Array<() => Promise<{ success: boolean; data?: any }>>,
  options?: Omit<UseFetchDataOptions<T>, 'fetchFn'>
) {
  const [data, setData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const results = await Promise.all(
        fetchFns.map(fn => fn().catch(err => ({ success: false, data: null, error: err })))
      );

      const successfulResults = results.map(r => r.data);
      setData(successfulResults);

      options?.onSuccess?.(successfulResults as any);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);

      if (options?.showErrorToast !== false) {
        toast.error(getErrorMessage(err, options?.errorMessage || 'Failed to load data'));
      }

      options?.onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFns, options]);

  useEffect(() => {
    if (options?.immediate !== false) {
      fetchData();
    }
  }, [...(options?.deps || [])]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData,
  };
}
