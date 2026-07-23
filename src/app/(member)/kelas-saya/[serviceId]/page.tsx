import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { auth } from "@/auth";
import { hasPaidEnrollment } from "@/lib/access";
import { getService } from "@/lib/services";
import { getModulesForService } from "@/lib/modules-admin";
import ModuleMaterials from "@/components/kelas/ModuleMaterials";

export default async function KelasContentPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/masuk?callbackUrl=/kelas-saya/" + serviceId);

  if (!(await hasPaidEnrollment(session.user.id, serviceId))) {
    redirect("/layanan/" + serviceId);
  }

  const service = await getService(serviceId);
  if (!service) notFound();

  const modules = await getModulesForService(serviceId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/kelas-saya"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={2} /> Kembali ke Kelas Saya
      </Link>

      {/* Class title + description */}
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {service.name}
        </h1>
        {service.description && (
          <p className="max-w-[62ch] text-sm text-muted-foreground">
            {service.description}
          </p>
        )}
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-14 text-center">
          <p className="text-sm text-muted-foreground">
            Materi kelas segera hadir ya, Ma. Tim kami sedang menyiapkannya
            dengan sepenuh hati.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {modules.map((mod, i) => (
            <section
              key={mod.id}
              className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6"
            >
              {/* Module header */}
              <div className="flex items-start gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {i + 1}
                </span>
                <div className="space-y-1 pt-0.5">
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Modul {i + 1}
                  </span>
                  <h2 className="text-lg font-semibold leading-snug">
                    {mod.title}
                  </h2>
                  {mod.description && (
                    <p className="text-sm text-muted-foreground">
                      {mod.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Video player */}
              {mod.videoPath && (
                <video
                  controls
                  preload="metadata"
                  src={`/api/video/${mod.id}`}
                  className="aspect-video w-full rounded-lg border border-border bg-black"
                >
                  Peramban Mama belum mendukung pemutar video.
                </video>
              )}

              {/* Materials */}
              {mod.materials.length > 0 && (
                <ModuleMaterials materials={mod.materials} />
              )}

              {/* Module with neither video nor materials */}
              {!mod.videoPath && mod.materials.length === 0 && (
                <p className="flex items-center gap-2 text-sm italic text-muted-foreground">
                  <PlayCircle className="size-4" strokeWidth={2} /> Materi modul ini segera hadir ya, Ma.
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
