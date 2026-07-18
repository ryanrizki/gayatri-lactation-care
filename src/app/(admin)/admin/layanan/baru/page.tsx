import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createService } from "@/lib/admin-actions";
import ServiceForm from "@/components/admin/ServiceForm";

export default function TambahLayananPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-3">
        <Link
          href="/admin/layanan"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Kembali ke daftar
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tambah Layanan
          </h1>
          <p className="text-sm text-muted-foreground">
            Buat paket layanan baru untuk ditampilkan ke pengguna.
          </p>
        </div>
      </div>

      <ServiceForm action={createService} submitLabel="Simpan" />
    </div>
  );
}
