"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updatePaymentSettingsAction } from "@/lib/enrollment-actions";
import type { PaymentSettings } from "@/lib/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FormState = { error?: string; ok?: boolean };

const fields = [
  {
    name: "bankName",
    label: "Nama bank",
    help: "Bank tujuan transfer, mis. BCA.",
    placeholder: "BCA",
    type: "text",
    inputMode: undefined,
  },
  {
    name: "accountNumber",
    label: "Nomor rekening",
    help: "Nomor rekening tujuan transfer.",
    placeholder: "1234567890",
    type: "text",
    inputMode: "numeric",
  },
  {
    name: "accountHolder",
    label: "Atas nama",
    help: "Nama pemilik rekening.",
    placeholder: "Gayatri Lactation Care",
    type: "text",
    inputMode: undefined,
  },
  {
    name: "whatsapp",
    label: "Nomor WhatsApp admin",
    help: "Angka dengan kode negara, tanpa tanda + atau spasi. Contoh: 6281234567890.",
    placeholder: "6281234567890",
    type: "text",
    inputMode: "numeric",
  },
] as const;

export default function PaymentSettingsForm({
  initial,
}: {
  initial: PaymentSettings;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updatePaymentSettingsAction,
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
          <span>Info pembayaran berhasil disimpan.</span>
        </div>
      ) : null}

      <div className="space-y-6 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6">
        {fields.map(({ name, label, help, placeholder, type, inputMode }) => (
          <div key={name} className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
              type={type}
              inputMode={inputMode}
              required={name !== "accountHolder"}
              placeholder={placeholder}
              defaultValue={initial[name]}
              className="max-w-sm"
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
