import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface PreviewPanelProps {
  port: number | null;
  expanded: boolean;
  onToggle: () => void;
}

export function PreviewPanel({ port, expanded, onToggle }: PreviewPanelProps) {
  const [iframeKey, setIframeKey] = useState(0);

  // Auto-refresh every 30s when expanded
  useEffect(() => {
    if (!expanded || port == null) return;
    const id = setInterval(() => {
      setIframeKey((k) => k + 1);
    }, 30_000);
    return () => clearInterval(id);
  }, [expanded, port]);

  const handleRefresh = () => {
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="rounded-b-lg overflow-hidden mt-auto">
      {/* Toggle bar */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-4 py-1.5 border-t cursor-pointer hover:bg-accent/50 text-xs text-muted-foreground"
      >
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        <span className="flex-1 text-left">
          {port != null ? `Preview (:${port})` : 'Preview'}
        </span>
        {expanded && port != null && (
          <button
            onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
            className="rounded p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Refresh preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </button>

      {/* iframe area — zoomed-out overview */}
      {expanded && port != null && (
        <div className="relative w-full overflow-hidden bg-black/5" style={{ height: '200px' }}>
          <div
            style={{
              width: '333.33%',
              height: '333.33%',
              transform: 'scale(0.3)',
              transformOrigin: '0 0',
              border: 0,
            }}
          >
            <iframe
              key={iframeKey}
              src={`http://localhost:${port}`}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0"
              title={`Preview :${port}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
