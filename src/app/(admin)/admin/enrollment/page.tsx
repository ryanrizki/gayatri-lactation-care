import Link from "next/link";
import { Inbox } from "lucide-react";
import { getEnrollmentsForAdmin, type EnrollStatus } from "@/lib/enrollments";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EnrollmentRowActions from "@/components/admin/EnrollmentRowActions";

const STATUSES: EnrollStatus[] = ["PENDING", "PAID", "CANCELLED"];

const statusLabels: Record<EnrollStatus, string> = {
  PENDING: "Menunggu",
  PAID: "Lunas",
  CANCELLED: "Dibatalkan",
};

const statusBadge: Record<EnrollStatus, string> = {
  PENDING:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  PAID: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-muted text-muted-foreground",
};

const filters = [
  { label: "Semua", value: undefined },
  { label: "Menunggu", value: "PENDING" as const },
  { label: "Lunas", value: "PAID" as const },
  { label: "Dibatalkan", value: "CANCELLED" as const },
];

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function parseStatus(raw?: string): EnrollStatus | undefined {
  return STATUSES.includes(raw as EnrollStatus)
    ? (raw as EnrollStatus)
    : undefined;
}

export default async function AdminEnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const status = parseStatus(rawStatus);
  const enrollments = await getEnrollmentsForAdmin(status);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Enrollment
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola pembelian kelas: konfirmasi pembayaran atau batalkan.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = status === f.value;
          return (
            <Link
              key={f.label}
              href={f.value ? `/admin/enrollment?status=${f.value}` : "/admin/enrollment"}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {enrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-5" strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Belum ada enrollment</p>
            <p className="text-sm text-muted-foreground">
              Pembelian kelas dari pengguna akan muncul di sini.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4">Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="px-4 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((e) => {
                const st = e.status as EnrollStatus;
                return (
                  <TableRow key={e.id}>
                    <TableCell className="px-4 font-medium">
                      {e.user.nama}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.user.email}
                    </TableCell>
                    <TableCell>{e.service.name}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                          statusBadge[st],
                        )}
                      >
                        {statusLabels[st]}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {dateFmt.format(e.requestedAt)}
                    </TableCell>
                    <TableCell className="px-4">
                      <EnrollmentRowActions
                        id={e.id}
                        status={st}
                        label={`${e.user.nama} · ${e.service.name}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
