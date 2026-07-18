"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateEstimatorConfig } from "@/lib/admin-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FormState = { error?: string; ok?: boolean };

type EstimatorInitial = {
  freeRadiusKm: number;
  feePerKm: number;
  baseTransportFee: number;
};

const fields = [
  {
    name: "freeRadiusKm",
    label: "Radius bebas biaya (km)",
    help: "Jarak dari klinik yang tidak dikenakan biaya transport.",
    step: "0.1",
  },
  {
    name: "feePerKm",
    label: "Tarif per km (Rp)",
    help: "Biaya per kilometer di luar radius bebas biaya.",
    step: "1",
  },
  {
    name: "baseTransportFee",
    label: "Biaya transport dasar (Rp)",
    help: "Biaya tetap yang ditambahkan untuk setiap kunjungan homecare.",
    step: "1",
  },
] as const;

export default function EstimatorSettingsForm({
  initial,
}: {
  initial: EstimatorInitial;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateEstimatorConfig,
    {},
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

      {state.ok ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3.5 py-3 text-sm text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>Pengaturan tarif berhasil disimpan.</span>
        </div>
      ) : null}

      <div className="space-y-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        {fields.map(({ name, label, help, step }) => (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
              type="number"
              min={0}
              step={step}
              required
              defaultValue={initial[name]}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">{help}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
