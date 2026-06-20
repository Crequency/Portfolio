import { useState, useEffect, useRef, useCallback } from 'react';

export type PingState = 'low' | 'high' | 'disconnected';

export interface PingResult {
  latency: number | null; // ms
  state: PingState;
}

const DISCONNECT_THRESHOLD = 1000; // ms — a single ping above this is a "miss"
const CONSECUTIVE_MISSES = 3;      // consecutive misses before showing disconnected

/**
 * Periodically ping /api/health and measure round-trip latency.
 * Requires 3 consecutive pings > 1000ms (or errors) before showing "disconnected".
 */
export function usePing(intervalMs: number = 7000): PingResult {
  const [latency, setLatency] = useState<number | null>(null);
  const [state, setState] = useState<PingState>('disconnected');
  const missCount = useRef(0);
  const mountedRef = useRef(true);

  const update = useCallback((ms: number | null) => {
    const isMiss = ms === null || ms > DISCONNECT_THRESHOLD;
    if (isMiss) {
      missCount.current++;
    } else {
      missCount.current = 0;
    }

    const newState: PingState =
      missCount.current >= CONSECUTIVE_MISSES
        ? 'disconnected'
        : ms !== null && ms < 100
          ? 'low'
          : 'high';

      setLatency(ms);
      setState(newState);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    missCount.current = 0;

    async function ping() {
      const start = performance.now();
      try {
        const res = await fetch('/api/health');
        if (!mountedRef.current) return;
        if (res.ok) {
          update(Math.round(performance.now() - start));
        } else {
          update(null);
        }
      } catch {
        if (mountedRef.current) update(null);
      }
    }

    ping();
    const id = setInterval(ping, intervalMs);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [intervalMs, update]);

  return { latency, state };
}
