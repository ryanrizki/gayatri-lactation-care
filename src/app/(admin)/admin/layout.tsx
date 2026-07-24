import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import AdminNav from "@/components/admin/AdminNav";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const name = session.user.name ?? "Admin";
  const initial = name.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="min-h-[100dvh] bg-muted/40 text-foreground">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1400px]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
          <Link href="/admin" className="flex items-center gap-2.5 px-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              G
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Gayatri</span>
              <span className="text-xs text-muted-foreground">Panel Admin</span>
            </span>
          </Link>

          <div className="mt-8 flex-1">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Menu
            </p>
            <AdminNav />
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center gap-3 px-2 pb-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                {initial}
              </span>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">Administrator</span>
              </div>
            </div>
            <AdminLogoutButton variant="outline" size="lg" className="w-full justify-start" />
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar (mobile) */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                G
              </span>
              <span className="text-sm font-semibold">Panel Admin</span>
            </Link>
            <AdminLogoutButton variant="ghost" size="sm" />
          </header>

          {/* Mobile nav strip */}
          <div className="border-b border-border bg-card px-3 py-2 lg:hidden">
            <AdminNav orientation="horizontal" />
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
