import { useCallback, useMemo, useState } from "react";
import { gasGet, gasPost } from "../utils/gasApi";

export default function useGAS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const execute = useCallback(async (fn) => {
    setLoading(true);
    setError("");

    try {
      const result = await fn();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan tidak dikenal.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(
    (action, params = {}, options = {}) => execute(() => gasGet(action, params, options)),
    [execute],
  );

  const post = useCallback(
    (action, data = {}, options = {}) => execute(() => gasPost(action, data, options)),
    [execute],
  );

  return useMemo(
    () => ({
      loading,
      error,
      get,
      post,
    }),
    [error, get, loading, post],
  );
}
