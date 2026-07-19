"use client";

import { useTransition } from "react";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { moveModuleAction, deleteModuleAction } from "@/lib/module-actions";
import { Button } from "@/components/ui/button";

export default function ModuleRowActions({
  id,
  serviceId,
  title,
  canMoveUp,
  canMoveDown,
}: {
  id: string;
  serviceId: string;
  title: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const move = (direction: "up" | "down") => {
    startTransition(async () => {
      await moveModuleAction(id, serviceId, direction);
    });
  };

  const remove = () => {
    if (!confirm(`Hapus modul "${title}"? Semua materi di dalamnya ikut terhapus.`))
      return;
    startTransition(async () => {
      await deleteModuleAction(id, serviceId);
    });
  };

  return (
    <div className="flex items-center gap-1.5">
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
  );
}
