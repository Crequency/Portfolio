import type { Tag } from '@portfolio/shared';
import { computeTagColors } from '@/lib/tagColorUtils.js';
import { useTheme } from '@/lib/theme.js';

interface TagChipProps {
  tag: Tag | string; // string for backward compat with old data
}

function isTag(t: Tag | string): t is Tag {
  return typeof t === 'object' && 'name' in t && 'color' in t;
}

const FALLBACK_COLOR = '#6b7280';

export function TagChip({ tag }: TagChipProps) {
  // Re-render on theme change so computeTagColors picks up the new mode
  useTheme();
  const name = isTag(tag) ? tag.name : tag;
  const color = isTag(tag) ? tag.color : FALLBACK_COLOR;
  const { bg, text } = computeTagColors(color);

  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {name}
    </span>
  );
}
