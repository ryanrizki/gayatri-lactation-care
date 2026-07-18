import Link from "next/link";
import { Plus, Pencil, PackageOpen, Layers } from "lucide-react";
import { getAllServices } from "@/lib/services-admin";
import { formatIDR } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ServiceActiveToggle from "@/components/admin/ServiceActiveToggle";

const categoryLabels: Record<string, string> = {
  consultation: "Konsultasi",
  class: "Kelas",
};

export default async function AdminLayananPage() {
  const services = await getAllServices();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Layanan
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola paket layanan laktasi yang tampil di halaman publik.
          </p>
        </div>
        <Link
          href="/admin/layanan/baru"
          className={buttonVariants({ size: "lg", className: "shrink-0" })}
        >
          <Plus className="size-4" strokeWidth={2} />
          Tambah Layanan
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <PackageOpen className="size-5" strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Belum ada layanan</p>
            <p className="text-sm text-muted-foreground">
              Tambahkan layanan pertama untuk menampilkannya ke pengguna.
            </p>
          </div>
          <Link
            href="/admin/layanan/baru"
            className={buttonVariants({ size: "lg", className: "mt-1" })}
          >
            <Plus className="size-4" strokeWidth={2} />
            Tambah Layanan
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4">Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="px-4 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="px-4 font-medium">
                    {service.name}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                      {categoryLabels[service.category] ?? service.category}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatIDR(service.price)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        service.active
                          ? "inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                          : "inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {service.active ? "Aktif" : "Nonaktif"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4">
                    <div className="flex items-center justify-end gap-3">
                      {service.category === "class" ? (
                        <Link
                          href={`/admin/layanan/${service.id}/modul`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          <Layers className="size-3.5" strokeWidth={2} />
                          Kelola Modul
                        </Link>
                      ) : null}
                      <Link
                        href={`/admin/layanan/${service.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        <Pencil className="size-3.5" strokeWidth={2} />
                        Edit
                      </Link>
                      <ServiceActiveToggle
                        id={service.id}
                        active={service.active}
                        label={service.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
