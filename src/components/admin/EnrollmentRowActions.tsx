"use client";

import { useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  confirmEnrollmentAction,
  cancelEnrollmentAction,
} from "@/lib/enrollment-actions";
import { Button } from "@/components/ui/button";

type Status = "PENDING" | "PAID" | "CANCELLED";

export default function EnrollmentRowActions({
  id,
  status,
  label,
}: {
  id: string;
  status: Status;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  const confirm_ = () => {
    startTransition(async () => {
      await confirmEnrollmentAction(id);
    });
  };

  const cancel_ = () => {
    if (!confirm(`Batalkan enrollment "${label}"?`)) return;
    startTransition(async () => {
      await cancelEnrollmentAction(id);
    });
  };

  if (status === "CANCELLED") {
    return (
      <span className="text-sm text-muted-foreground">Tidak ada aksi</span>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {status === "PENDING" ? (
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={confirm_}
        >
          <CheckCircle2 className="size-3.5" strokeWidth={2} />
          Tandai Lunas
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={cancel_}
      >
        <XCircle className="size-3.5" strokeWidth={2} />
        Batalkan
      </Button>
    </div>
  );
}
