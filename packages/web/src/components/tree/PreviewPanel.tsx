import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, RefreshCw, Eye } from "lucide-react";

interface PreviewPanelProps {
  port: number | null;
  expanded: boolean;
  onToggle: () => void;
  refreshKey?: number;
  backendPort?: number | null;
  onRefreshAll?: () => void;
  powerSaving?: boolean;
}

export function PreviewPanel({
  port,
  expanded,
  onToggle,
  refreshKey = 0,
  backendPort,
  onRefreshAll,
  powerSaving,
}: PreviewPanelProps) {
  const { t } = useTranslation();
  const [localKey, setLocalKey] = useState(0);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const [clickedThrough, setClickedThrough] = useState(false);
  const [leaveCountdown, setLeaveCountdown] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const screenshotRef = useRef<string | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownValueRef = useRef(5);

  const handleRefresh = useCallback(() => {
    setLocalKey((k) => k + 1);
    setScreenshot(null);
    screenshotRef.current = null;
  }, []);

  // Request screenshot from iframe via postMessage (cross-origin safe)
  const requestScreenshot = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      console.log(
        "[Portfolio Parent] sending screenshot request for port",
        port,
      );
      win.postMessage({ action: "screenshot" }, "*");
    } else {
      console.log("[Portfolio Parent] iframe not ready for port", port);
    }
  }, [port]);

  // Listen for screenshot results — filter by port
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.action === "screenshot" && e.data.port === port) {
        if (e.data.dataUrl) {
          setScreenshot(e.data.dataUrl);
          screenshotRef.current = e.data.dataUrl;
        } else {
          console.log(
            "[Portfolio Parent] Screenshot failed for port",
            port,
            "— full msg:",
            JSON.stringify(e.data),
          );
        }
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [port]);

  // Clear screenshot on refresh/port change, start timer for new screenshot
  useEffect(() => {
    if (!expanded || port == null) {
      setScreenshot(null);
      return;
    }

    setScreenshot(null);
    screenshotRef.current = null;
    if (!powerSaving) return;

    let attempts = 0;
    const max = 5;
    const interval = setInterval(() => {
      if (screenshotRef.current || attempts >= max) {
        clearInterval(interval);
        return;
      }
      requestScreenshot();
      attempts++;
    }, 4000);

    return () => clearInterval(interval);
  }, [expanded, port, localKey, refreshKey, powerSaving, requestScreenshot]);

  // Show iframe when power saving is off, no screenshot yet, or user clicked through
  const showIframe = !powerSaving || !screenshot || clickedThrough;

  const handleMouseEnter = useCallback(() => {
    setHover(true);
    // Cancel any running countdown
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setLeaveCountdown(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
    if (clickedThrough && powerSaving && screenshot) {
      // Start 5s countdown before switching back to image
      countdownValueRef.current = 5;
      setLeaveCountdown(5);
      countdownTimerRef.current = setInterval(() => {
        countdownValueRef.current -= 1;
        if (countdownValueRef.current <= 0) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setClickedThrough(false);
          setLeaveCountdown(null);
        } else {
          setLeaveCountdown(countdownValueRef.current);
        }
      }, 1000);
    } else {
      setClickedThrough(false);
    }
  }, [clickedThrough, powerSaving, screenshot]);

  // Cleanup countdown timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  return (
    <div className="rounded-b-lg overflow-hidden mt-auto">
      {/* Toggle bar */}
      <div
        onClick={onToggle}
        role="button"
        className="flex items-center gap-2 w-full px-4 py-1.5 border-t cursor-pointer hover:bg-accent/50 text-xs text-muted-foreground"
      >
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        <span className="flex-1 text-left">
          {port != null ? `Preview (:${port})` : "Preview"}
          {powerSaving && screenshot && " · screenshot"}
        </span>
        {expanded && port != null && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRefreshAll?.();
            }}
            className="rounded p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
            title="Refresh this preview\nRight-click: Refresh all previews"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Preview area */}
      {expanded && port != null && (
        <div
          className="relative w-full overflow-hidden bg-black/5"
          style={{ height: "200px" }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showIframe ? (
            <div
              style={{
                width: "333.33%",
                height: "333.33%",
                transform: "scale(0.3)",
                transformOrigin: "0 0",
                border: 0,
              }}
            >
              {powerSaving ? (
                <iframe
                  ref={iframeRef}
                  key={`${localKey}-${refreshKey}`}
                  src={
                    backendPort
                      ? `http://p${port}.localhost:${backendPort}/`
                      : `/__p__/${port}/`
                  }
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="w-full h-full border-0"
                  title={`Preview :${port}`}
                />
              ) : (
                <iframe
                  key={`${localKey}-${refreshKey}`}
                  src={`http://localhost:${port}`}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="w-full h-full border-0"
                  title={`Preview :${port}`}
                />
              )}
            </div>
          ) : (
            screenshot && (
              <div className="relative w-full h-full">
                <img
                  src={screenshot}
                  alt={`Preview :${port}`}
                  className="w-full h-full object-cover object-top"
                />
                {/* Hover mask — click to switch to live iframe. Always rendered for fade animation */}
                <div
                  className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-opacity duration-300 ${
                    hover
                      ? "opacity-100 cursor-pointer"
                      : "opacity-0 pointer-events-none"
                  }`}
                  onClick={() => hover && setClickedThrough(true)}
                >
                  <Eye className="h-8 w-8 text-white mb-2" />
                  <span className="text-white text-sm font-medium">
                    {t("preview.clickToView")}
                  </span>
                </div>
                <span className="absolute bottom-1.5 left-1.5 rounded border border-white/20 bg-black/60 px-1.5 py-0.5 text-[9px] text-white/80 font-mono select-none pointer-events-none shadow">
                  IMG
                </span>
              </div>
            )
          )}

          {/* Countdown badge — shows when iframe will revert to image */}
          {leaveCountdown !== null && showIframe && (
            <span className="absolute bottom-1.5 left-1.5 rounded border border-white/20 bg-black/60 px-1.5 py-0.5 text-[9px] text-white/80 font-mono select-none pointer-events-none shadow z-20">
              {leaveCountdown}s
            </span>
          )}
        </div>
      )}
    </div>
  );
}
