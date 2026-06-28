interface CanvasBackgroundProps {
  setRef?: (el: HTMLDivElement | null) => void;
}

export function CanvasBackground({ setRef }: CanvasBackgroundProps) {
  return (
    <div
      ref={setRef}
      className="canvas-grid absolute inset-0 opacity-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
