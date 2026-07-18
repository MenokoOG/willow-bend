import { useEffect, useState } from "react";

export interface FetchState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export default function useFetch<T>(
  url: string,
  options?: RequestInit
): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    loading: true,
    error: null,
    data: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetch(url, { ...options, signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ loading: false, error, data: null });
      });

    return () => controller.abort();
  }, [url]);

  return state;
}
