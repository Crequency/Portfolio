import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { Tag } from '@portfolio/shared';
import { TAG_PALETTE, computeTagColors } from '@/lib/tagColorUtils.js';

interface Props {
  open: boolean;
  definedTags: Tag[];
  onAdd: (tag: Tag) => void;
  onRemove: (name: string) => void;
  onClose: () => void;
}

export function TagManagerModal({ open, definedTags, onAdd, onRemove, onClose }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState(TAG_PALETTE[0]);

  if (!open) return null;

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, color });
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">{t('tags.manageTitle')}</h2>

        {/* Add new */}
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            placeholder={t('tags.addPlaceholder')}
            autoFocus
          />
          <button
            type="button"
            onClick={add}
            disabled={!name.trim()}
            className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {t('tags.add')}
          </button>
        </div>

        {/* Color palette */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {TAG_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-5 w-5 rounded-full border-2 transition-transform"
              style={{
                backgroundColor: c,
                borderColor: color === c ? 'hsl(var(--foreground))' : 'transparent',
                transform: color === c ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Defined tags list */}
        {definedTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-auto custom-scrollbar">
            {definedTags.map((tg) => {
              const { bg, text } = computeTagColors(tg.color);
              return (
                <span key={tg.name} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: bg, color: text }}>
                  {tg.name}
                  <button onClick={() => onRemove(tg.name)} className="hover:opacity-70"><X className="h-3 w-3" /></button>
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t('tags.noDefined')}</p>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">{t('tags.done')}</button>
        </div>
      </div>
    </div>
  );
}
