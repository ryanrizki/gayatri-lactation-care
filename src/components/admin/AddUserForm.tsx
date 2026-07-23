"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, UserPlus, X } from "lucide-react";
import { createUserAction } from "@/lib/user-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FormState = { error?: string; ok?: boolean };

export default function AddUserForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createUserAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form fields on success; keep panel open to show confirmation.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  if (!open) {
    return (
      <Button type="button" size="lg" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" strokeWidth={2} />
        Tambah user
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5 rounded-xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Tambah user baru</h2>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Tutup">
          <X className="size-4" strokeWidth={2} />
        </Button>
      </div>

      {state.error ? (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>{state.error}</span>
        </div>
      ) : null}

      {state.ok ? (
        <div role="status" className="flex items-start gap-2.5 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3.5 py-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          <span>User berhasil dibuat.</span>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="nama">Nama</Label>
          <Input id="nama" name="nama" type="text" required placeholder="Mama Ayu" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="mama@contoh.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="text" required minLength={8} placeholder="min 8 karakter" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan user"}
        </Button>
      </div>
    </form>
  );
}
