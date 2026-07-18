"use client";

import { useActionState, useState } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormState = { error?: string };

type ServiceInitial = {
  name: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  image: string;
  sortOrder: number;
  active: boolean;
};

export default function ServiceForm({
  action,
  initial,
  submitLabel = "Simpan",
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  initial?: ServiceInitial;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );
  const [features, setFeatures] = useState<string[]>(
    initial?.features?.length ? initial.features : [""],
  );

  const setFeature = (index: number, value: string) =>
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
  const addFeature = () => setFeatures((prev) => [...prev, ""]);
  const removeFeature = (index: number) =>
    setFeatures((prev) =>
      prev.length === 1 ? [""] : prev.filter((_, i) => i !== index),
    );

  return (
    <form action={formAction} className="space-y-8">
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
          <Label htmlFor="name">Nama layanan</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={initial?.name}
            placeholder="Contoh: Konsultasi Laktasi Homecare"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="category">Kategori</Label>
          <select
            id="category"
            name="category"
            defaultValue={initial?.category ?? "consultation"}
            className={cn(
              "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30",
            )}
          >
            <option value="consultation">Konsultasi</option>
            <option value="class">Kelas</option>
          </select>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Harga (Rp)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={0}
              step={1}
              defaultValue={initial?.price ?? 0}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sortOrder">Urutan tampil</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              step={1}
              defaultValue={initial?.sortOrder ?? 0}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={initial?.description}
            placeholder="Jelaskan manfaat dan cakupan layanan untuk Mama."
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="image">URL gambar</Label>
          <Input
            id="image"
            name="image"
            type="url"
            defaultValue={initial?.image}
            placeholder="https://…"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Fitur layanan</p>
            <p className="text-sm text-muted-foreground">
              Poin manfaat yang tampil di kartu layanan.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFeature}
          >
            <Plus className="size-3.5" strokeWidth={2} />
            Tambah fitur
          </Button>
        </div>

        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                name="features"
                value={feature}
                onChange={(e) => setFeature(index, e.target.value)}
                aria-label={`Fitur ${index + 1}`}
                placeholder={`Fitur ${index + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFeature(index)}
                aria-label={`Hapus fitur ${index + 1}`}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" strokeWidth={2} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        <Label htmlFor="active" className="cursor-pointer flex-col items-start gap-0.5">
          <span className="text-sm font-medium">Aktif</span>
          <span className="text-sm font-normal text-muted-foreground">
            Tampilkan layanan ini di halaman publik.
          </span>
        </Label>
        <Switch
          id="active"
          name="active"
          defaultChecked={initial?.active ?? true}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Menyimpan…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
