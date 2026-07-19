"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Film, UploadCloud } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ALLOWED_TYPES = ["video/mp4", "video/webm"];
const MAX_SIZE = 500 * 1024 * 1024; // 500MB

type Status = "idle" | "uploading" | "done" | "error";

function messageForStatus(status: number, fallback: string): string {
  if (status === 403) return "Sesi admin berakhir. Silakan masuk kembali.";
  if (status === 413) return "Ukuran file melebihi batas (maks 500 MB).";
  if (status === 415) return "Tipe file tidak diizinkan. Gunakan MP4 atau WebM.";
  return fallback || "Gagal mengunggah video.";
}

export default function VideoUploadField({
  moduleId,
  initialPath,
}: {
  moduleId?: string;
  initialPath?: string | null;
}) {
  const [path, setPath] = useState<string | null>(initialPath ?? null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [replacing, setReplacing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showPicker = !path || replacing;

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus("error");
      setError("Tipe file tidak diizinkan. Gunakan MP4 atau WebM.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > MAX_SIZE) {
      setStatus("error");
      setError("Ukuran file melebihi batas (maks 500 MB).");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setStatus("uploading");
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `/api/admin/upload?kind=video&filename=${encodeURIComponent(file.name)}`,
    );
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { path?: string };
          if (data.path) {
            setPath(data.path);
            setUploadedName(file.name);
            setStatus("done");
            setReplacing(false);
            return;
          }
        } catch {
          /* fall through to error */
        }
        setStatus("error");
        setError("Respons server tidak valid.");
        return;
      }
      let serverMsg = "";
      try {
        serverMsg = (JSON.parse(xhr.responseText) as { error?: string }).error ?? "";
      } catch {
        /* ignore */
      }
      setStatus("error");
      setError(messageForStatus(xhr.status, serverMsg));
    };

    xhr.onerror = () => {
      setStatus("error");
      setError("Gagal mengunggah. Periksa koneksi Anda.");
    };

    xhr.send(file);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="video-upload">Video Modul</Label>
      <input type="hidden" name="videoPath" value={path ?? ""} />

      {showPicker ? (
        <div className="grid gap-2">
          <label
            htmlFor="video-upload"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-background px-4 py-8 text-center transition-colors hover:border-ring hover:bg-muted/40"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UploadCloud className="size-5" strokeWidth={2} />
            </span>
            <span className="text-sm font-medium">Pilih file video</span>
            <span className="text-xs text-muted-foreground">
              MP4 atau WebM, maksimal 500 MB
            </span>
          </label>
          <input
            ref={inputRef}
            id="video-upload"
            type="file"
            accept="video/mp4,video/webm"
            className="sr-only"
            onChange={handleFile}
            disabled={status === "uploading"}
          />
          {replacing ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-self-start"
              onClick={() => {
                setReplacing(false);
                setError(null);
                if (status === "error") setStatus("done");
              }}
            >
              Batal
            </Button>
          ) : null}
        </div>
      ) : null}

      {status === "uploading" ? (
        <div className="grid gap-1.5" aria-live="polite">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Mengunggah…</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>{error}</span>
        </div>
      ) : null}

      {path && status !== "uploading" ? (
        <div className="grid gap-3 rounded-lg border border-border bg-background p-3">
          {status === "done" ? (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} />
              <span>Terunggah{uploadedName ? ` (${uploadedName})` : ""}</span>
            </p>
          ) : null}

          {moduleId ? (
            <video
              src={`/api/video/${moduleId}`}
              controls
              preload="metadata"
              className="w-full rounded-md bg-black"
            />
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Film className="size-4 shrink-0" strokeWidth={2} />
              <span>Video siap disimpan. Pratinjau tersedia setelah modul disimpan.</span>
            </p>
          )}

          {!replacing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() => {
                setReplacing(true);
                setError(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Ganti Video
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
