import type { SlideDefinition } from './slideRegistry';
import { SLIDE_METAS } from './slideRegistry';
import { COMPONENT_MAP } from './componentMap';

// Build full SlideDefinition array by resolving component references
export function getSlides(): SlideDefinition[] {
  return SLIDE_METAS.map((meta) => ({
    ...meta,
    component: COMPONENT_MAP[meta.id],
  }));
}

export function getSlideById(id: string): SlideDefinition | null {
  const meta = SLIDE_METAS.find((s) => s.id === id);
  if (!meta) return null;
  return {
    ...meta,
    component: COMPONENT_MAP[meta.id],
  };
}

export function getParent(slide: SlideDefinition): SlideDefinition | null {
  if (!slide.parentId) return null;
  return getSlideById(slide.parentId);
}

export function getChildren(slide: SlideDefinition): SlideDefinition[] {
  return slide.childrenIds
    .map((id) => getSlideById(id))
    .filter((s): s is SlideDefinition => s !== null);
}

export function getSiblings(slide: SlideDefinition): SlideDefinition[] {
  const parent = getParent(slide);
  if (!parent) return [];
  return getChildren(parent);
}

export function getPreviousSibling(slide: SlideDefinition): SlideDefinition | null {
  const siblings = getSiblings(slide);
  const idx = siblings.findIndex((s) => s.id === slide.id);
  if (idx <= 0) return null;
  return siblings[idx - 1];
}

export function getNextSibling(slide: SlideDefinition): SlideDefinition | null {
  const siblings = getSiblings(slide);
  const idx = siblings.findIndex((s) => s.id === slide.id);
  if (idx < 0 || idx >= siblings.length - 1) return null;
  return siblings[idx + 1];
}

export function getSlidePath(slide: SlideDefinition): SlideDefinition[] {
  const path: SlideDefinition[] = [];
  let current: SlideDefinition | null = slide;
  while (current) {
    path.unshift(current);
    current = getParent(current);
  }
  return path;
}

export function getFirstChild(slide: SlideDefinition): SlideDefinition | null {
  const children = getChildren(slide);
  return children.length > 0 ? children[0] : null;
}

export function getLastLeaf(slide: SlideDefinition): SlideDefinition {
  const children = getChildren(slide);
  if (children.length === 0) return slide;
  return getLastLeaf(children[children.length - 1]);
}

export function getRoot(): SlideDefinition {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return getSlideById('title')!;
}
