import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  defaultOpenMethod: string;
  checkInterval: number;
  onClose: () => void;
  onSave: (settings: { defaultOpenMethod: string; checkInterval: number }) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function SettingsDialog({ open, defaultOpenMethod, checkInterval, onClose, onSave, onExport, onImport }: Props) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">{t('settings.title')}</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('settings.defaultOpenMethod')}</label>
            <select
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              defaultValue={defaultOpenMethod}
              id="openMethod"
            >
              <option value="explorer">{t('settings.explorer')}</option>
              <option value="code">{t('settings.code')}</option>
              <option value="terminal">{t('settings.terminal')}</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">{t('settings.checkInterval')}</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              defaultValue={checkInterval}
              min={0}
              id="checkInterval"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onExport}
              className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              {t('settings.export')}
            </button>
            <label className="flex-1 rounded-md border px-3 py-2 text-sm text-center hover:bg-accent cursor-pointer">
              {t('settings.import')}
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onImport(file);
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md px-3 py-2 text-sm hover:bg-accent">{t('common.cancel')}</button>
          <button
            onClick={() => {
              const method = (document.getElementById('openMethod') as HTMLSelectElement).value;
              const interval = parseInt((document.getElementById('checkInterval') as HTMLInputElement).value, 10);
              onSave({ defaultOpenMethod: method, checkInterval: interval });
              onClose();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
