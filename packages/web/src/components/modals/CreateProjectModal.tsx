import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { CreateProjectBody, Tag } from '@portfolio/shared';
import { TAG_PALETTE, computeTagColors } from '@/lib/tagColorUtils.js';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (body: CreateProjectBody) => Promise<void>;
  definedTags: Tag[];
}

export function CreateProjectModal({ open, onClose, onSave, definedTags }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagColor, setTagColor] = useState(TAG_PALETTE[0]);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed || tags.some((t) => t.name === trimmed)) return;
    setTags([...tags, { name: trimmed, color: tagColor }]);
    setTagInput('');
  };

  const removeTag = (name: string) => {
    setTags(tags.filter((t) => t.name !== name));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        path: path.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      setName('');
      setDescription('');
      setPath('');
      setTags([]);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">{t('project.new')}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('project.nameRequired')}</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('project.namePlaceholder')} autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium">{t('project.description')}</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('project.descPlaceholder')} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('project.path')}</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={path} onChange={(e) => setPath(e.target.value)} placeholder={t('project.pathPlaceholder')} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('project.tags')}</label>
            {/* Add tag row */}
            <div className="flex gap-2 mt-1">
              <input
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="tag name"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {/* Defined tag suggestions */}
            {definedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {definedTags
                  .filter((dt) => !tags.some((t) => t.name === dt.name))
                  .map((dt) => {
                    const { bg, text } = computeTagColors(dt.color);
                    return (
                      <button
                        key={dt.name}
                        type="button"
                        onClick={() => {
                          setTags([...tags, dt]);
                          setTagInput('');
                        }}
                        className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium hover:ring-2 ring-primary/50"
                        style={{ backgroundColor: bg, color: text }}
                      >
                        {dt.name}
                      </button>
                    );
                  })}
              </div>
            )}
            {/* Color palette */}
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {TAG_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTagColor(c)}
                  className="h-5 w-5 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: c,
                    borderColor: tagColor === c ? 'hsl(var(--foreground))' : 'transparent',
                    transform: tagColor === c ? 'scale(1.25)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            {/* Tag chips */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => {
                  const { bg, text } = computeTagColors(tag.color);
                  return (
                    <span key={tag.name} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: bg, color: text }}>
                      {tag.name}
                      <button onClick={() => removeTag(tag.name)} className="hover:opacity-70"><X className="h-3 w-3" /></button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md px-3 py-2 text-sm hover:bg-accent">{t('common.cancel')}</button>
          <button onClick={handleSave} disabled={!name.trim() || saving} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
