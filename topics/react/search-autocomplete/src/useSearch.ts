import { useEffect, useRef, useState } from "react";

export type SearchItem = { id: string; label: string; value: string };

export function useSearch(
  query: string,
  fetcher: (q: string, signal?: AbortSignal) => Promise<SearchItem[]>,
  { minChars = 2, enabled = true } = {}
) {
  const [data, setData] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!enabled || q.length < minChars) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetcher(q, controller.signal)
      .then((res) => setData(res || []))
      .catch((e) => {
        if (e?.name !== "AbortError") {
          setError(e?.message ?? "검색 오류");
          setData([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query, minChars, fetcher, enabled]);

  return { data, loading, error };
}
