import { useState, useEffect, useRef } from 'react';
import { pingPort } from '@/lib/api.js';

const INTERVAL_MS = 1000;

export function useServiceLatency(port: number, status: 'running' | 'stopped' | 'unknown') {
  const [latency, setLatency] = useState<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (status !== 'running') {
      setLatency(null);
      return;
    }

    async function measure() {
      try {
        const result = await pingPort(port);
        if (mountedRef.current) {
          setLatency(result.latency);
        }
      } catch {
        if (mountedRef.current) {
          setLatency(null);
        }
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
