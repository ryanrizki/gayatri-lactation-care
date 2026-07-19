"use client";

import { useActionState, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Trash2,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  createMaterialAction,
  moveMaterialAction,
  deleteMaterialAction,
} from "@/lib/module-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import FileUploadField from "@/components/admin/FileUploadField";

type FormState = { error?: string };

type Material = {
  id: string;
  title: string;
  type: string;
  isPreview: boolean;
  filePath: string | null;
};

const typeLabels: Record<string, string> = {
  PDF: "PDF",
  VIDEO: "Video",
  LINK: "Tautan",
};

function MaterialRow({
  material,
  moduleId,
  serviceId,
  canMoveUp,
  canMoveDown,
}: {
  material: Material;
  moduleId: string;
  serviceId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const move = (direction: "up" | "down") => {
    startTransition(async () => {
      await moveMaterialAction(material.id, moduleId, serviceId, direction);
    });
  };

  const remove = () => {
    if (!confirm(`Hapus materi "${material.title}"?`)) return;
    startTransition(async () => {
      await deleteMaterialAction(material.id, moduleId, serviceId);
    });
  };

  const isUploaded = material.type === "PDF" || material.type === "VIDEO";

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="font-medium">{material.title}</span>
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
            {typeLabels[material.type] ?? material.type}
          </span>
          {material.isPreview ? (
            <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Preview
            </span>
          ) : null}
        </div>
        {material.filePath ? (
          isUploaded ? (
            <a
              href={`/api/material/${material.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <ExternalLink className="size-3.5 shrink-0" strokeWidth={2} />
              Lihat
            </a>
          ) : (
            <a
              href={material.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit max-w-full items-center gap-1.5 truncate text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <ExternalLink className="size-3.5 shrink-0" strokeWidth={2} />
              <span className="truncate">{material.filePath}</span>
            </a>
          )
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || !canMoveUp}
          onClick={() => move("up")}
        >
          <ArrowUp className="size-3.5" strokeWidth={2} />
          Naik
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || !canMoveDown}
          onClick={() => move("down")}
        >
          <ArrowDown className="size-3.5" strokeWidth={2} />
          Turun
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={remove}
        >
          <Trash2 className="size-3.5" strokeWidth={2} />
          Hapus
        </Button>
      </div>
    </li>
  );
}

export default function MaterialManager({
  moduleId,
  serviceId,
  materials,
}: {
  moduleId: string;
  serviceId: string;
  materials: Material[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createMaterialAction.bind(null, moduleId, serviceId),
    {},
  );
  const [type, setType] = useState("PDF");
  const isUploadType = type === "PDF" || type === "VIDEO";

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">Materi</h2>

      {materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileText className="size-5" strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Belum ada materi</p>
            <p className="text-sm text-muted-foreground">
              Tambahkan materi pertama lewat formulir di bawah.
            </p>
          </div>
        </div>
      ) : (
        <ol className="space-y-2">
          {materials.map((material, index) => (
            <MaterialRow
              key={material.id}
              material={material}
              moduleId={moduleId}
              serviceId={serviceId}
              canMoveUp={index > 0}
              canMoveDown={index < materials.length - 1}
            />
          ))}
        </ol>
      )}

      <form
        action={formAction}
        className="space-y-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
      >
        <h3 className="text-sm font-semibold">Tambah Materi</h3>

        {state.error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <span>{state.error}</span>
          </div>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor="material-title">Judul Materi</Label>
          <Input
            id="material-title"
            name="title"
            required
            placeholder="Contoh: Panduan Pelekatan (PDF)"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="material-type">Tipe</Label>
            <select
              id="material-type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={cn(
                "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
              )}
            >
              <option value="PDF">PDF</option>
              <option value="VIDEO">Video</option>
              <option value="LINK">Tautan</option>
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={isUploadType ? "file-upload-filePath" : "material-filePath"}>
            {isUploadType ? "File" : "URL Tautan"}
          </Label>
          {isUploadType ? (
            <FileUploadField key={type} name="filePath" />
          ) : (
            <Input
              id="material-filePath"
              name="filePath"
              placeholder="https://…"
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
          <Label
            htmlFor="material-isPreview"
            className="cursor-pointer flex-col items-start gap-0.5"
          >
            <span className="text-sm font-medium">Cuplikan gratis (preview)</span>
            <span className="text-sm font-normal text-muted-foreground">
              Materi ini bisa diakses tanpa membeli kelas.
            </span>
          </Label>
          <Switch id="material-isPreview" name="isPreview" defaultChecked={false} />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Tambah Materi"}
        </Button>
      </form>
    </section>
  );
}
