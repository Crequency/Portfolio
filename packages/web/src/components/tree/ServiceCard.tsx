import type { Service } from '@portfolio/shared';
import { LatencyChip } from '@/components/common/LatencyChip.js';
import { useServiceLatency } from '@/hooks/useServiceLatency.js';
import { useTranslation } from 'react-i18next';

interface ServiceCardProps {
  service: Service;
  hasConflict: boolean;
  checking: boolean;
}

export function ServiceCard({ service, hasConflict, checking }: ServiceCardProps) {
  const { t } = useTranslation();
  const isRunning = service.status === 'running';
  const latency = useServiceLatency(service.port, isRunning ? 'running' : 'unknown');
  // Running services keep current status; only non-running show checking animation
  const showChecking = checking && !isRunning;

  const statusDot: Record<string, string> = {
    running: 'bg-green-500',
    stopped: 'bg-red-500',
    unknown: 'bg-gray-400',
  };

  const tooltip = [
    service.name,
    service.description,
    `${t('service.port')}: ${service.port}`,
    `${service.status}`,
    service.lastCheckedAt ? `Checked: ${new Date(service.lastCheckedAt).toLocaleString()}` : null,
  ].filter(Boolean).join('\n');

  return (
    <div
      title={tooltip}
      onClick={() => navigator.clipboard.writeText(String(service.port))}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/30 select-none ${
        hasConflict ? 'border-yellow-500 bg-yellow-500/5' : 'bg-card'
      }`}
    >
      {/* Status dot or checking animation */}
      {showChecking ? (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
        </span>
      ) : (
        <span className={`inline-block h-2 w-2 rounded-full ${statusDot[service.status]}`} />
      )}

      {/* Port */}
      <span className="font-mono tabular-nums font-medium">{service.port}</span>

      {/* Latency */}
      {isRunning && <LatencyChip latency={latency} />}
    </div>
  );
}
