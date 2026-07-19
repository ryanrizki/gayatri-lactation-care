import Link from "next/link";
import { ArrowRight, Package, GraduationCap, Settings } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPendingCount } from "@/lib/enrollments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [session, totalServices, activeServices, pendingEnrollments] =
    await Promise.all([
      auth(),
      prisma.service.count(),
      prisma.service.count({ where: { active: true } }),
      getPendingCount(),
    ]);

  const name = session?.user?.name ?? "Admin";

  const links = [
    {
      href: "/admin/layanan",
      title: "Kelola Layanan",
      description: "Tambah, ubah, dan atur paket layanan laktasi.",
      Icon: Package,
    },
    {
      href: "/admin/enrollment",
      title: "Kelola Enrollment",
      description: "Konfirmasi pembayaran kelas atau batalkan pembelian.",
      Icon: GraduationCap,
    },
    {
      href: "/admin/pengaturan",
      title: "Pengaturan",
      description: "Konfigurasi tarif transport dan info pembayaran.",
      Icon: Settings,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Halo, {name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan singkat panel administrasi Gayatri.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Layanan</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {totalServices}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {activeServices} aktif ditampilkan ke pengguna.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Layanan Aktif</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {activeServices}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Terlihat di halaman publik /layanan.
          </CardContent>
        </Card>

        <Link href="/admin/enrollment?status=PENDING" className="group">
          <Card
            className={
              pendingEnrollments > 0
                ? "h-full ring-1 ring-amber-500/30 transition-colors hover:bg-muted/50"
                : "h-full transition-colors hover:bg-muted/50"
            }
          >
            <CardHeader>
              <CardDescription>Enrollment Menunggu</CardDescription>
              <CardTitle
                className={
                  pendingEnrollments > 0
                    ? "text-3xl font-semibold tabular-nums text-amber-600 dark:text-amber-400"
                    : "text-3xl font-semibold tabular-nums"
                }
              >
                {pendingEnrollments}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-1 text-sm text-muted-foreground">
              Perlu konfirmasi pembayaran
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Akses cepat</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(({ href, title, description, Icon }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className="size-4" strokeWidth={2} />
                    </span>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                  </div>
                  <CardTitle className="mt-3">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
