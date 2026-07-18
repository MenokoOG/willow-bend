import { useCallback, useEffect, useState } from "react";

export interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  value: T | null;
}

export default function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): AsyncState<T> & { execute: () => Promise<T> } {
  const [state, setState] = useState<AsyncState<T>>({
    loading: false,
    error: null,
    value: null,
  });

  const execute = useCallback(async () => {
    setState({ loading: true, error: null, value: null });
    try {
      const value = await asyncFunction();
      setState({ loading: false, error: null, value });
      return value;
    } catch (error) {
      setState({
        loading: false,
        error: error as Error,
        value: null,
      });
      throw error;
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, execute };
}
