import { Router } from "express";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

const HOST_RE = /^p(\d+)\.localhost$/i;

function screenshotShim(port: number) {
  return `
<script>
(function() {
  if (window.__portfolio_screenshot__) return;
  window.__portfolio_screenshot__ = true;

  var libReady = false;
  var pendingSource = null;
  var toJpeg = null;

  window.addEventListener('message', function(e) {
    if (!e.data || e.data.action !== 'screenshot') return;
    console.log('[Portfolio] received screenshot request, ready=' + libReady);
    if (libReady) {
      doScreenshot(e.source);
    } else {
      pendingSource = e.source;
    }
  });

  function doScreenshot(target) {
    if (!document.body || !document.body.innerHTML.trim()) {
      console.log('[Portfolio] doScreenshot: body empty');
      target.postMessage({ action: 'screenshot', port: ${port}, dataUrl: null, error: 'body empty' }, '*');
      return;
    }
    console.log('[Portfolio] doScreenshot: taking screenshot via html-to-image');
    if (!toJpeg) {
      target.postMessage({ action: 'screenshot', port: ${port}, dataUrl: null, error: 'lib not loaded' }, '*');
      return;
    }
    toJpeg(document.body, {
      quality: 0.6,
      pixelRatio: 0.5,
      cacheBust: true,
      skipFonts: true,
    })
    .then(function(dataUrl) {
      console.log('[Portfolio] doScreenshot: dataUrl length', dataUrl.length);
      target.postMessage({ action: 'screenshot', port: ${port}, dataUrl: dataUrl }, '*');
    })
    .catch(function(e) {
      var msg = (e && e.message) ? e.message : (e && e.type ? e.type : String(e || 'unknown'));
      console.log('[Portfolio] doScreenshot: error', e, msg);
      target.postMessage({ action: 'screenshot', port: ${port}, dataUrl: null, error: msg }, '*');
    });
  }

  function loadLib(url) {
    return import(url).then(function(m) {
      return m.toJpeg;
    });
  }

  loadLib('https://esm.sh/html-to-image@1.11.11')
    .catch(function(e) {
      console.log('[Portfolio] esm.sh failed, trying jsdelivr:', e);
      return loadLib('https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm');
    })
    .then(function(fn) {
      toJpeg = fn;
      libReady = true;
      console.log('[Portfolio] html-to-image loaded, pending:', !!pendingSource);
      if (pendingSource) doScreenshot(pendingSource);
    })
    .catch(function(e) {
      console.log('[Portfolio] CDN load failed:', e);
      libReady = true;
      if (pendingSource) {
        pendingSource.postMessage({ action: 'screenshot', port: ${port}, dataUrl: null, error: 'CDN load failed' }, '*');
      }
    });
})();
</script>
`;
}

router.use(
  "/",
  asyncHandler(async (req, res, next) => {
    const hostname = String(req.headers.host || "").replace(/:.*$/, "");
    const m = hostname.match(HOST_RE);
    if (!m) return next();

    const port = parseInt(m[1], 10);
    if (port < 1 || port > 65535) return next();

    const upstream = `http://localhost:${port}${req.originalUrl}`;

    try {
      // Forward auth + content headers to target
      const fwdHeaders: Record<string, string> = {};
      const h = req.headers;
      if (h["cookie"]) fwdHeaders["cookie"] = h["cookie"] as string;
      if (h["authorization"])
        fwdHeaders["authorization"] = h["authorization"] as string;
      if (h["content-type"])
        fwdHeaders["content-type"] = h["content-type"] as string;

      const fetchOpts: RequestInit = {
        method: req.method,
        signal: AbortSignal.timeout(8000),
        headers: fwdHeaders,
      };
      if (req.method !== "GET" && req.method !== "HEAD") {
        if (
          req.body &&
          typeof req.body === "object" &&
          Object.keys(req.body).length > 0
        ) {
          fetchOpts.body = JSON.stringify(req.body);
        }
      }
      const r = await fetch(upstream, {
        ...fetchOpts,
        redirect: "follow",
      });

      const ct = r.headers.get("content-type") || "";
      if (ct) res.set("content-type", ct);
      res.set("access-control-allow-origin", "*");

      if (ct.includes("text/html")) {
        let html = await r.text();
        const hasBody = /<\/body>/i.test(html);
        console.log(
          `[Proxy] inject shim for port ${port}, status=${r.status}, hasBody=${hasBody}, len=${html.length}`,
        );
        const shim = screenshotShim(port);
        if (hasBody) {
          html = html.replace(/<\/body>/i, shim + "</body>");
        } else {
          html += shim;
        }
        res.status(r.status).send(html);
      } else {
        const buf = await r.arrayBuffer();
        res.status(r.status).send(Buffer.from(buf));
      }
    } catch {
      if (!res.headersSent) {
        res
          .status(502)
          .json({
            ok: false,
            error: { code: "INTERNAL_ERROR", message: "Proxy failed" },
          });
      }
    }
  }),
);

// ── WebSocket proxy (no extra deps, uses Node built-in net) ──

import type http from "node:http";
import net from "node:net";

export function setupWsProxy(server: http.Server) {
  server.on("upgrade", (req, socket, head) => {
    const hostname = String(req.headers.host || "").replace(/:.*$/, "");
    const m = hostname.match(HOST_RE);
    if (!m) {
      socket.destroy();
      return;
    }

    const port = parseInt(m[1], 10);

    // Connect to target
    const target = net.connect({ host: "127.0.0.1", port }, () => {
      // Forward client's upgrade request to target
      const headers = Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("\r\n");

      target.write(`${req.method} ${req.url} HTTP/1.1\r\n${headers}\r\n\r\n`);
      if (head.length > 0) target.write(head);

      // Pipe both ways
      socket.pipe(target).pipe(socket);
    });

    target.on("error", () => {
      socket.destroy();
      target.destroy();
    });

    socket.on("error", () => {
      target.destroy();
      socket.destroy();
    });
  });
}

export default router;
