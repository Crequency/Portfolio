interface LatencyChipProps {
  latency: number | null;
}

export function LatencyChip({ latency }: LatencyChipProps) {
  if (latency === null) return null;

  const color =
    latency < 5 ? 'text-green-500' :
    latency < 20 ? 'text-green-600 dark:text-green-400' :
    latency < 50 ? 'text-yellow-500' :
    latency < 200 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-500';

  return (
    <span className={`inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono tabular-nums ${color}`}>
      {latency} ms
    </span>
  );
}
