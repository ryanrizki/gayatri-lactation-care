import Link from "next/link";
import { ArrowRight, Package, Settings } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [session, totalServices, activeServices] = await Promise.all([
    auth(),
    prisma.service.count(),
    prisma.service.count({ where: { active: true } }),
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
      href: "/admin/pengaturan",
      title: "Pengaturan",
      description: "Konfigurasi tarif transport dan preferensi klinik.",
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Akses cepat</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
