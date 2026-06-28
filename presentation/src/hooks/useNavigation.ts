import { useState, useCallback, useRef } from 'react';
import type { SlideDefinition } from '@/lib/slideRegistry';
import {
  getSlideById,
  getFirstChild,
  getParent,
  getPreviousSibling,
  getNextSibling,
  getLastLeaf,
  getRoot,
} from '@/lib/slideTree';

export interface NavigationState {
  currentSlideId: string;
  previousSlideId: string | null;
  isTransitioning: boolean;
}

export function useNavigation(initialSlideId?: string) {
  const rootId = getRoot().id;
  const [state, setState] = useState<NavigationState>({
    currentSlideId: initialSlideId || rootId,
    previousSlideId: null,
    isTransitioning: false,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const currentSlide = getSlideById(state.currentSlideId);
  const canGoDown = currentSlide ? getFirstChild(currentSlide) !== null : false;
  const canGoUp = currentSlide ? currentSlide.parentId !== null : false;
  const canGoLeft = currentSlide ? getPreviousSibling(currentSlide) !== null : false;
  const canGoRight = currentSlide ? getNextSibling(currentSlide) !== null : false;

  const setTransitioning = useCallback((v: boolean) => {
    setState((s) => ({ ...s, isTransitioning: v }));
  }, []);

  const goToSlide = useCallback((targetId: string) => {
    const target = getSlideById(targetId);
    if (!target) return;

    setState((s) => ({
      currentSlideId: target.id,
      previousSlideId: s.currentSlideId,
      isTransitioning: s.isTransitioning,
    }));
    return target;
  }, []);

  const goDown = useCallback((): SlideDefinition | null => {
    if (stateRef.current.isTransitioning) return null;
    const current = getSlideById(stateRef.current.currentSlideId);
    if (!current) return null;
    const child = getFirstChild(current);
    if (!child) return null;

    setState((s) => ({
      currentSlideId: child.id,
      previousSlideId: s.currentSlideId,
      isTransitioning: true,
    }));
    return child;
  }, []);

  const goUp = useCallback((): SlideDefinition | null => {
    if (stateRef.current.isTransitioning) return null;
    const current = getSlideById(stateRef.current.currentSlideId);
    if (!current) return null;
    const parent = getParent(current);
    if (!parent) return null;

    setState((s) => ({
      currentSlideId: parent.id,
      previousSlideId: s.currentSlideId,
      isTransitioning: true,
    }));
    return parent;
  }, []);

  const goLeft = useCallback((): SlideDefinition | null => {
    if (stateRef.current.isTransitioning) return null;
    const current = getSlideById(stateRef.current.currentSlideId);
    if (!current) return null;
    const prev = getPreviousSibling(current);
    if (!prev) return null;

    setState((s) => ({
      currentSlideId: prev.id,
      previousSlideId: s.currentSlideId,
      isTransitioning: true,
    }));
    return prev;
  }, []);

  const goRight = useCallback((): SlideDefinition | null => {
    if (stateRef.current.isTransitioning) return null;
    const current = getSlideById(stateRef.current.currentSlideId);
    if (!current) return null;
    const next = getNextSibling(current);
    if (!next) return null;

    setState((s) => ({
      currentSlideId: next.id,
      previousSlideId: s.currentSlideId,
      isTransitioning: true,
    }));
    return next;
  }, []);

  const goHome = useCallback((): SlideDefinition | null => {
    if (stateRef.current.isTransitioning) return null;
    const root = getRoot();

    setState((s) => ({
      currentSlideId: root.id,
      previousSlideId: s.currentSlideId,
      isTransitioning: true,
    }));
    return root;
  }, []);

  const goEnd = useCallback((): SlideDefinition | null => {
    if (stateRef.current.isTransitioning) return null;
    const root = getRoot();
    const last = getLastLeaf(root);

    setState((s) => ({
      currentSlideId: last.id,
      previousSlideId: s.currentSlideId,
      isTransitioning: true,
    }));
    return last;
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setState((s) => ({ ...s, isTransitioning: false }));
  }, []);

  return {
    currentSlide,
    previousSlideId: state.previousSlideId,
    isTransitioning: state.isTransitioning,
    canGoDown,
    canGoUp,
    canGoLeft,
    canGoRight,
    goDown,
    goUp,
    goLeft,
    goRight,
    goHome,
    goEnd,
    goToSlide,
    setTransitioning,
    handleTransitionComplete,
  };
}
