"use client";

import { useState, useTransition } from "react";
import { KeyRound, Trash2 } from "lucide-react";
import { deleteUserAction, resetPasswordAction } from "@/lib/user-actions";
import { Button } from "@/components/ui/button";

export default function UserRowActions({
  id,
  nama,
  isSelf,
}: {
  id: string;
  nama: string;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ error?: string; ok?: string } | null>(null);

  const resetPw = () => {
    const pw = window.prompt(
      `Password baru untuk "${nama}" (min 8 karakter):`,
    );
    if (pw === null) return;
    startTransition(async () => {
      const res = await resetPasswordAction(id, pw);
      setMsg(res.error ? { error: res.error } : { ok: "Password direset." });
    });
  };

  const remove = () => {
    if (!window.confirm(`Hapus user "${nama}"? Enrollment ikut terhapus. Tidak bisa dibatalkan.`)) return;
    startTransition(async () => {
      const res = await deleteUserAction(id);
      if (res.error) setMsg({ error: res.error });
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-1.5">
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={resetPw}>
          <KeyRound className="size-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Reset password</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || isSelf}
          onClick={remove}
          title={isSelf ? "Tidak bisa menghapus akun sendiri" : undefined}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Hapus</span>
        </Button>
      </div>
      {msg?.error ? (
        <span role="alert" className="text-xs text-destructive">{msg.error}</span>
      ) : msg?.ok ? (
        <span role="status" className="text-xs text-emerald-600 dark:text-emerald-400">{msg.ok}</span>
      ) : null}
    </div>
  );
}
