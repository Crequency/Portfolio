import { useState, useEffect, useRef } from 'react';
import { pingPort } from '@/lib/api.js';

const INTERVAL_MS = 5000;

// Module-level cache: survives mount/unmount across view switches
const cache = new Map<number, { latency: number | null; ts: number }>();

export function useServiceLatency(port: number, status: 'running' | 'stopped' | 'unknown') {
  const cached = cache.get(port)?.latency ?? null;
  const [latency, setLatency] = useState<number | null>(cached);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (status !== 'running') {
      setLatency(null);
      cache.set(port, { latency: null, ts: Date.now() });
      return;
    }

    async function measure() {
      try {
        const result = await pingPort(port);
        if (mountedRef.current) {
          setLatency(result.latency);
        }
        cache.set(port, { latency: result.latency, ts: Date.now() });
      } catch {
        if (mountedRef.current) {
          setLatency(null);
        }
        cache.set(port, { latency: null, ts: Date.now() });
      }
    }

    measure();
    const id = setInterval(measure, INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [port, status]);

  return latency;
}
