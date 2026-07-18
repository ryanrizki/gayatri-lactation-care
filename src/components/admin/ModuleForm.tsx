"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type FormState = { error?: string };

type ModuleInitial = {
  title: string;
  description: string;
  isPreview: boolean;
  durationSec: number | null;
  videoPath: string | null;
};

export default function ModuleForm({
  action,
  initial,
  submitLabel = "Simpan",
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initial?: ModuleInitial;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>{state.error}</span>
        </div>
      ) : null}

      <div className="space-y-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <div className="grid gap-2">
          <Label htmlFor="title">Judul Modul</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={initial?.title}
            placeholder="Contoh: Pengenalan Pelekatan"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initial?.description}
            placeholder="Ringkasan isi modul untuk peserta kelas."
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="durationSec">Durasi (detik)</Label>
            <Input
              id="durationSec"
              name="durationSec"
              type="number"
              min={0}
              step={1}
              defaultValue={initial?.durationSec ?? undefined}
              placeholder="Opsional"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="videoPath">
            URL Video (sementara — upload di fase berikutnya)
          </Label>
          <Input
            id="videoPath"
            name="videoPath"
            defaultValue={initial?.videoPath ?? undefined}
            placeholder="https://…"
          />
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
          <Label
            htmlFor="isPreview"
            className="cursor-pointer flex-col items-start gap-0.5"
          >
            <span className="text-sm font-medium">Cuplikan gratis (preview)</span>
            <span className="text-sm font-normal text-muted-foreground">
              Modul ini bisa dilihat tanpa membeli kelas.
            </span>
          </Label>
          <Switch
            id="isPreview"
            name="isPreview"
            defaultChecked={initial?.isPreview ?? false}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Menyimpan…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
