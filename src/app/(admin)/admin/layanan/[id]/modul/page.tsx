import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Pencil, ListVideo } from "lucide-react";
import { getServiceForEdit } from "@/lib/services-admin";
import { getModulesForService } from "@/lib/modules-admin";
import { createModuleAction } from "@/lib/module-actions";
import { buttonVariants } from "@/components/ui/button";
import ModuleForm from "@/components/admin/ModuleForm";
import ModuleRowActions from "@/components/admin/ModuleRowActions";

function formatDuration(sec: number | null): string | null {
  if (sec == null) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s} dtk`;
  return s === 0 ? `${m} mnt` : `${m} mnt ${s} dtk`;
}

export default async function ModulPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceForEdit(id);
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-3">
        <Link
          href="/admin/layanan"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Kembali ke daftar layanan
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Modul: {service.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Susun modul dan materi untuk kelas digital ini.
          </p>
        </div>
      </div>

      {service.category !== "class" ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Layers className="size-5" strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Bukan kelas digital</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Layanan ini bukan kelas digital, jadi tidak punya modul.
            </p>
          </div>
          <Link
            href="/admin/layanan"
            className={buttonVariants({ variant: "outline", className: "mt-1" })}
          >
            <ArrowLeft className="size-4" strokeWidth={2} />
            Kembali ke daftar layanan
          </Link>
        </div>
      ) : (
        <ModulBuilder id={id} />
      )}
    </div>
  );
}

async function ModulBuilder({ id }: { id: string }) {
  const modules = await getModulesForService(id);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Daftar Modul</h2>
          <span className="text-sm text-muted-foreground">
            {modules.length} modul
          </span>
        </div>

        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ListVideo className="size-5" strokeWidth={2} />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium">Belum ada modul</p>
              <p className="text-sm text-muted-foreground">
                Tambahkan modul pertama lewat formulir di bawah.
              </p>
            </div>
          </div>
        ) : (
          <ol className="space-y-3">
            {modules.map((mod, index) => {
              const duration = formatDuration(mod.durationSec);
              return (
                <li
                  key={mod.id}
                  className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="font-medium">{mod.title}</span>
                        {mod.isPreview ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            Preview
                          </span>
                        ) : null}
                      </div>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-8 text-sm text-muted-foreground">
                        <span>{mod.materials.length} materi</span>
                        {duration ? <span>· {duration}</span> : null}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 pl-8 sm:pl-0">
                      <Link
                        href={`/admin/layanan/${id}/modul/${mod.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        <Pencil className="size-3.5" strokeWidth={2} />
                        Edit
                      </Link>
                      <ModuleRowActions
                        id={mod.id}
                        serviceId={id}
                        title={mod.title}
                        canMoveUp={index > 0}
                        canMoveDown={index < modules.length - 1}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Tambah Modul</h2>
        <ModuleForm
          action={createModuleAction.bind(null, id)}
          submitLabel="Tambah Modul"
        />
      </section>
    </div>
  );
}
