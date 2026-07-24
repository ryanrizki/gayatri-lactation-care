"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Client-side logout for admin shell. Uses next-auth/react `signOut` (not the
 * server action) so the client SessionProvider cache is cleared immediately —
 * otherwise the public header keeps showing a stale session until manual refresh.
 */
export default function AdminLogoutButton({
  variant = "outline",
  size = "lg",
  className,
}: {
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => signOut({ redirectTo: "/" })}
    >
      <LogOut className="size-4" strokeWidth={2} />
      Keluar
    </Button>
  );
}
