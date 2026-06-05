import { useState, useEffect, useRef } from 'react';

export type PingState = 'low' | 'high' | 'disconnected';

export interface PingResult {
  latency: number | null; // ms
  state: PingState;
}

/**
 * Periodically ping /api/health and measure round-trip latency.
 * - < 100ms → low (green)
 * - 100–500ms → high (yellow)
 * - > 500ms or error → disconnected (red)
 */
export function usePing(intervalMs: number = 3000): PingResult {
  const [result, setResult] = useState<PingResult>({ latency: null, state: 'disconnected' });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function ping() {
      const start = performance.now();
      try {
        const res = await fetch('/api/health');
        if (!mountedRef.current) return;
        if (res.ok) {
          const latency = Math.round(performance.now() - start);
          const state: PingState = latency < 100 ? 'low' : latency < 500 ? 'high' : 'disconnected';
          setResult({ latency, state });
        } else {
          setResult({ latency: null, state: 'disconnected' });
        }
      } catch {
        if (mountedRef.current) {
          setResult({ latency: null, state: 'disconnected' });
        }
      }
    }

    // Ping immediately, then on interval
    ping();
    const id = setInterval(ping, intervalMs);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return result;
}
