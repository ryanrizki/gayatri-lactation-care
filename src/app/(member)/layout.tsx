import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, Compass } from "lucide-react";
import { auth, signOut } from "@/auth";
import MemberNav from "@/components/member/MemberNav";
import { Button } from "@/components/ui/button";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk?callbackUrl=/kelas-saya");
  if (session.user.role === "ADMIN") redirect("/admin");

  const name = session.user.name ?? "Mama";
  const initial = name.trim().charAt(0).toUpperCase() || "M";

  return (
    <div className="min-h-[100dvh] bg-muted/40 text-foreground">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1400px]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
          <Link href="/kelas-saya" className="flex items-center gap-2.5 px-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              G
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Gayatri</span>
              <span className="text-xs text-muted-foreground">Ruang Kelas</span>
            </span>
          </Link>

          <div className="mt-8 flex-1">
            <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Menu
            </p>
            <MemberNav />

            <div className="mt-6">
              <Link
                href="/layanan"
                className="group inline-flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Compass className="size-4 shrink-0" strokeWidth={2} />
                <span>Jelajahi Kelas</span>
              </Link>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center gap-3 px-2 pb-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                {initial}
              </span>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">Member</span>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="outline" size="lg" type="submit" className="w-full justify-start">
                <LogOut className="size-4" strokeWidth={2} />
                Keluar
              </Button>
            </form>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar (mobile) */}
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
            <Link href="/kelas-saya" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                G
              </span>
              <span className="text-sm font-semibold">Ruang Kelas</span>
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit" aria-label="Keluar">
                <LogOut className="size-4" strokeWidth={2} />
                Keluar
              </Button>
            </form>
          </header>

          {/* Mobile nav strip */}
          <div className="flex items-center gap-1 border-b border-border bg-card px-3 py-2 lg:hidden">
            <MemberNav orientation="horizontal" />
            <Link
              href="/layanan"
              className="group inline-flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors whitespace-nowrap hover:bg-muted hover:text-foreground"
            >
              <Compass className="size-4 shrink-0" strokeWidth={2} />
              <span>Jelajahi Kelas</span>
            </Link>
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
