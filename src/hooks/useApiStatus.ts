import { useState, useEffect } from "react";

export function useApiStatus() {
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    let settled = false;

    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => { controller.abort(); }, 500);

        const res = await fetch("/api/trpc/ping", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });

        clearTimeout(timeout);
        settled = true;

        if (!cancelled) {
          setIsApiConnected(res.ok);
        }
      } catch {
        settled = true;
        if (!cancelled) {
          setIsApiConnected(false);
        }
      }
    };

    check();

    // If not settled after 600ms, show demo data
    const fallbackTimeout = setTimeout(() => {
      if (!settled && !cancelled) {
        setIsApiConnected(false);
      }
    }, 600);

    return () => { cancelled = true; clearTimeout(fallbackTimeout); };
  }, []);

  return isApiConnected;
}
