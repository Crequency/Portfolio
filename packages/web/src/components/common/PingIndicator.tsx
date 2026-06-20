import { useTranslation } from 'react-i18next';
import { usePing, type PingState } from '@/hooks/usePing.js';

const dotStyle: Record<PingState, string> = {
  low: 'bg-green-500',
  high: 'bg-yellow-500',
  disconnected: 'bg-red-500',
};

const textStyle: Record<PingState, string> = {
  low: 'text-green-600 dark:text-green-400',
  high: 'text-yellow-600 dark:text-yellow-400',
  disconnected: 'text-red-600 dark:text-red-400',
};

export function PingIndicator() {
  const { t } = useTranslation();
  const { latency, state } = usePing();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-xs select-none shadow-sm m-3">
      {/* Solid dot */}
      <span className={`inline-block h-2 w-2 rounded-full ${dotStyle[state]}`} />

      {/* Latency */}
      <span className={`font-mono tabular-nums ${textStyle[state]}`}>
        {latency !== null ? `${latency} ms` : '— ms'}
      </span>

      {/* Disconnected label only */}
      {state === 'disconnected' && (
        <span className={textStyle.disconnected}>{t('ping.disconnected')}</span>
      )}
    </div>
  );
}
