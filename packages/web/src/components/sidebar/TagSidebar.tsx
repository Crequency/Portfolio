import { useState, useRef, useCallback, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Tag } from '@portfolio/shared';
import { TagChip } from '@/components/common/TagChip.js';
import { Settings2, GripVertical } from 'lucide-react';

interface TagSidebarProps {
  collapsed: boolean;
  projectTags: (Tag | string)[];
  selectedTag: string | null;
  onSelectTag: (name: string | null) => void;
  onManageTags: () => void;
  onReorderTags?: (names: string[]) => void;
}

export function TagSidebar({ collapsed, projectTags, selectedTag, onSelectTag, onManageTags, onReorderTags }: TagSidebarProps) {
  const { t } = useTranslation();
  const dragIdx = useRef<number | null>(null);

  // Extract unique tag names, preserving order
  const uniqueNames = [...new Set(projectTags.map((t) => typeof t === 'string' ? t : t.name))];
  const [order, setOrder] = useState<string[]>(uniqueNames);

  // Sync with projectTags changes
  if (uniqueNames.length !== order.length || uniqueNames.some((n, i) => n !== order[i])) {
    // Add new names, keep existing order
    const existing = new Set(order);
    const added = uniqueNames.filter((n) => !existing.has(n));
    const kept = order.filter((n) => uniqueNames.includes(n));
    const next = [...kept, ...added].sort((a, b) => {
      const ia = uniqueNames.indexOf(a), ib = uniqueNames.indexOf(b);
      return ia - ib;
    });
    if (next.join() !== order.join()) {
      setOrder(next);
    }
  }

  const handleDragStart = useCallback((e: DragEvent, index: number) => {
    dragIdx.current = index;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    const from = dragIdx.current;
    if (from === null || from === targetIndex) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(targetIndex, 0, moved);
    setOrder(next);
    onReorderTags?.(next);
    dragIdx.current = null;
  }, [order, onReorderTags]);

  if (collapsed) {
    return <aside className="shrink-0 w-10 border-r" />;
  }

  return (
    <aside className="shrink-0 w-48 border-r flex flex-col">
      {/* Filter list */}
      <div className="flex-1 overflow-auto custom-scrollbar px-3 pt-3 pb-2 space-y-1">
        <h3 className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider px-1 mb-2">
          {t('sidebar.filters')}
        </h3>
        <button
          onClick={() => onSelectTag(null)}
          className={`block w-full text-left text-sm rounded-md px-2 py-1 ${!selectedTag ? 'bg-accent font-medium' : 'hover:bg-accent/50 text-muted-foreground'}`}
        >
          {t('sidebar.all')}
        </button>
        {order.map((name, idx) => {
          const tagObj = projectTags.find(
            (t) => (typeof t === 'string' ? t : t.name) === name,
          );
          return (
            <div
              key={name}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, idx)}
              className={`flex items-center gap-1 w-full text-left text-sm rounded-md px-1 py-1 cursor-grab active:cursor-grabbing ${name === selectedTag ? 'bg-accent font-medium' : 'hover:bg-accent/50 text-muted-foreground'}`}
            >
              <span className="text-muted-foreground/50">
                <GripVertical className="h-3 w-3" />
              </span>
              <button
                onClick={() => onSelectTag(name === selectedTag ? null : name)}
                className="flex-1 text-left"
              >
                {tagObj && typeof tagObj !== 'string' ? (
                  <TagChip tag={tagObj} />
                ) : (
                  <span>{name}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tag manager button */}
      <div className="border-t p-3 pb-14">
        <button
          onClick={onManageTags}
          className="flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
          {t('sidebar.manageTags')}
        </button>
      </div>
    </aside>
  );
}
