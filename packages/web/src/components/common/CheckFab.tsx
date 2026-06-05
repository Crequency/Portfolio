import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Loader2, Check } from 'lucide-react';

interface CheckFabProps {
  onCheck: () => Promise<void>;
}

export function CheckFab({ onCheck }: CheckFabProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'checking' | 'done'>('idle');

  const handleCheck = async () => {
    setState('checking');
    try {
      await onCheck();
      setState('done');
      setTimeout(() => setState('idle'), 1500);
    } catch {
      setState('idle');
    }
  };

  return (
    <button
      onClick={handleCheck}
      disabled={state === 'checking'}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-70 transition-all hover:scale-105 active:scale-95"
      title={t('common.checkAll')}
    >
      {state === 'checking' ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === 'done' ? (
        <Check className="h-4 w-4" />
      ) : (
        <Play className="h-4 w-4" />
      )}
      <span>
        {state === 'checking' ? '...' : state === 'done' ? 'OK' : t('common.checkAll')}
      </span>
    </button>
  );
}
