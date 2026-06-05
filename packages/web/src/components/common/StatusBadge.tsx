import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: 'running' | 'stopped' | 'unknown';
  checking?: boolean;
}

const statusConfig: Record<string, { dot: string; text: string; key: string }> = {
  running: { dot: 'bg-green-500', text: 'text-green-600 dark:text-green-400', key: 'running' },
  stopped: { dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400', key: 'stopped' },
  unknown: { dot: 'bg-gray-400', text: 'text-gray-500', key: 'unknown' },
};

export function StatusBadge({ status, checking }: StatusBadgeProps) {
  const { t } = useTranslation();
  const cfg = statusConfig[status] || statusConfig.unknown;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      {checking ? (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
        </span>
      ) : (
        <span className={`inline-block h-2 w-2 rounded-full ${cfg.dot}`} />
      )}
      <span className={checking ? 'text-blue-500' : cfg.text}>
        {checking ? t('service.checking') : status}
      </span>
    </span>
  );
}
