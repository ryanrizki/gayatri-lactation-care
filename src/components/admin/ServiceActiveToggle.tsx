"use client";

import { useTransition } from "react";
import { toggleServiceActive } from "@/lib/admin-actions";
import { Switch } from "@/components/ui/switch";

export default function ServiceActiveToggle({
  id,
  active,
  label,
}: {
  id: string;
  active: boolean;
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={active}
      disabled={pending}
      aria-label={`${active ? "Nonaktifkan" : "Aktifkan"} layanan ${label}`}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          await toggleServiceActive(id, checked);
        });
      }}
    />
  );
}
