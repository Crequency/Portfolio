import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project, UpdateProjectBody } from '@portfolio/shared';

interface Props {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onSave: (id: string, body: UpdateProjectBody) => Promise<void>;
}

export function EditProjectModal({ open, project, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [path, setPath] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setPath(project.path || '');
      setTags(project.tags.join(', '));
    }
  }, [project]);

  if (!open || !project) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        path: path.trim() || undefined,
        tags: tags ? tags.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">{t('project.edit')}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t('project.nameRequired')}</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
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
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t('project.tagsPlaceholder')} />
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
