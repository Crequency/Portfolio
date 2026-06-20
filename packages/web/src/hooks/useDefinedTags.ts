import { useState, useCallback } from 'react';
import type { Tag } from '@portfolio/shared';

const STORAGE_KEY = 'portfolio-defined-tags';

function load(): Tag[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(tags: Tag[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
}

export function useDefinedTags() {
  const [tags, setTags] = useState<Tag[]>(load);

  const addTag = useCallback((tag: Tag) => {
    setTags((prev) => {
      const next = prev.filter((t) => t.name !== tag.name).concat(tag);
      save(next);
      return next;
    });
  }, []);

  const removeTag = useCallback((name: string) => {
    setTags((prev) => {
      const next = prev.filter((t) => t.name !== name);
      save(next);
      return next;
    });
  }, []);

  return { definedTags: tags, addDefinedTag: addTag, removeDefinedTag: removeTag };
}
