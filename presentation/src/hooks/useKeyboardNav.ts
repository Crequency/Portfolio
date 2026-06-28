import { useEffect, useRef } from 'react';
import type { SlideDefinition } from '@/lib/slideRegistry';

interface KeyboardNavCallbacks {
  goDown: () => SlideDefinition | null;
  goUp: () => SlideDefinition | null;
  goLeft: () => SlideDefinition | null;
  goRight: () => SlideDefinition | null;
  goHome: () => SlideDefinition | null;
  goEnd: () => SlideDefinition | null;
  isTransitioning: boolean;
}

interface TransitionExecutor {
  transitionTo: (slide: SlideDefinition, onComplete?: () => void) => void;
  jumpTo: (slide: SlideDefinition) => void;
}

export function useKeyboardNav(
  callbacks: KeyboardNavCallbacks,
  transition: TransitionExecutor,
  onTransitionComplete: () => void
) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const transitionRef = useRef(transition);
  transitionRef.current = transition;

  const onCompleteRef = useRef(onTransitionComplete);
  onCompleteRef.current = onTransitionComplete;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const cb = callbacksRef.current;
      const tr = transitionRef.current;

      // Don't intercept when typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (cb.isTransitioning) {
        e.preventDefault();
        return;
      }

      let target: SlideDefinition | null = null;

      switch (e.key) {
        case 'ArrowDown':
        case ' ': // Space
          e.preventDefault();
          target = cb.goDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (e.shiftKey) {
            target = cb.goUp();
          } else {
            target = cb.goUp();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          target = cb.goLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          target = cb.goRight();
          break;
        case 'Home':
          e.preventDefault();
          target = cb.goHome();
          break;
        case 'End':
          e.preventDefault();
          target = cb.goEnd();
          break;
        case 'Escape':
          e.preventDefault();
          target = cb.goUp();
          break;
        default:
          return;
      }

      if (target) {
        tr.transitionTo(target, () => {
          onCompleteRef.current();
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
