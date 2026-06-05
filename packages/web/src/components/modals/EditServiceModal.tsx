import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Service, UpdateServiceBody } from '@portfolio/shared';

interface Props {
  open: boolean;
  service: Service | null;
  projectName: string;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (body: UpdateServiceBody) => Promise<any>;
}

export function EditServiceModal({ open, service, projectName, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [port, setPort] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (service) {
      setName(service.name);
      setPort(String(service.port));
      setDescription(service.description || '');
      setWarning(null);
    }
  }, [service]);

  if (!open || !service) return null;

  const portNum = parseInt(port, 10);
  const portValid = !isNaN(portNum) && portNum >= 1 && portNum <= 65535;

  const handleSave = async () => {
    if (!name.trim() || !portValid) return;
    setSaving(true);
    setWarning(null);
    try {
      const result = await onSave({ name: name.trim(), port: portNum, description: description.trim() || undefined });
      if (result && result.warning) {
        setWarning(t('service.conflict', { port: portNum }));
      } else {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-1">{t('service.edit')}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t('service.in', { project: projectName })}</p>
        {warning && <div className="mb-4 rounded-md border border-yellow-500 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400">{warning}</div>}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('service.nameRequired')}</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium">{t('service.portRange')}</label>
            <input type="number" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={port} onChange={(e) => setPort(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('service.description')}</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('service.descPlaceholder')} />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md px-3 py-2 text-sm hover:bg-accent">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={!name.trim() || !portValid || saving} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
