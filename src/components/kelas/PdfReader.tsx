"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { clampPage } from "@/lib/pdf";

const MAX_WIDTH = 760;

// pdf.js is loaded at runtime as a native ES module from public/ (NOT bundled by
// webpack — its modern ESM breaks Next's bundler). Cached on window across mounts.
async function loadPdfjs(): Promise<typeof import("pdfjs-dist")> {
  const w = window as unknown as { __pdfjs?: typeof import("pdfjs-dist") };
  if (!w.__pdfjs) {
    // @ts-expect-error served from public/, resolved at runtime by the browser
    const lib = (await import(/* webpackIgnore: true */ "/pdfjs/pdf.min.mjs")) as typeof import("pdfjs-dist");
    lib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
    w.__pdfjs = lib;
  }
  return w.__pdfjs;
}

export default function PdfReader({ url, title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderTaskRef = useRef<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);

  // Track container width (responsive canvas).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(Math.min(el.clientWidth, MAX_WIDTH));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load the document once per url.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await loadPdfjs();
        // Same-origin request → browser attaches the session cookie (gated route).
        const doc = await pdfjs.getDocument({ url }).promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        docRef.current = doc;
        setPage(1);
        setNumPages(doc.numPages);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel?.();
      docRef.current?.destroy?.();
      docRef.current = null;
    };
  }, [url]);

  // Render the current page whenever page / width / doc changes.
  useEffect(() => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas || failed || numPages === 0 || width === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await doc.getPage(page);
        if (cancelled) return;
        const base = p.getViewport({ scale: 1 });
        const viewport = p.getViewport({ scale: width / base.width });
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        renderTaskRef.current?.cancel?.();
        const task = p.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch {
        // render cancelled (page flip / unmount) or failed — ignore.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, width, numPages, failed]);

  function go(delta: number) {
    setPage((cur) => clampPage(cur + delta, numPages));
  }

  return (
    <div
      ref={containerRef}
      className="mt-3 rounded-2xl border border-border bg-muted overflow-hidden"
    >
      {failed ? (
        <div className="px-4 py-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Gagal memuat PDF. Coba unduh untuk membaca.</p>
          <a
            href={url}
            download
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-primary text-primary-foreground text-sm font-bold"
          >
            <Download className="w-4 h-4" /> Unduh {title}
          </a>
        </div>
      ) : (
        <>
          <div className="flex justify-center bg-muted p-3 overflow-auto min-h-[120px]">
            {numPages === 0 ? (
              <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat PDF…
              </div>
            ) : (
              <canvas ref={canvasRef} className="shadow-sm rounded-lg max-w-full h-auto" />
            )}
          </div>

          {/* Pager */}
          <div className="flex items-center justify-between gap-2 px-3 py-3 bg-card border-t border-border">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full text-sm font-bold text-foreground bg-muted border border-border hover:bg-muted/70 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <span className="text-sm font-bold text-foreground tabular-nums">
              Hal {page} / {numPages || "…"}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={numPages > 0 && page >= numPages}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Berikutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
