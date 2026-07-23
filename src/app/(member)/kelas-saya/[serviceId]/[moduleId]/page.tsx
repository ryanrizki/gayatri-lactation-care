import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { auth } from "@/auth";
import { hasPaidEnrollment } from "@/lib/access";
import { getService } from "@/lib/services";
import { getModulesForService } from "@/lib/modules-admin";
import ModuleMaterials from "@/components/kelas/ModuleMaterials";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ serviceId: string; moduleId: string }>;
}) {
  const { serviceId, moduleId } = await params;

  const session = await auth();
  if (!session?.user?.id)
    redirect(`/masuk?callbackUrl=/kelas-saya/${serviceId}/${moduleId}`);

  if (!(await hasPaidEnrollment(session.user.id, serviceId))) {
    redirect("/layanan/" + serviceId);
  }

  const service = await getService(serviceId);
  if (!service) notFound();

  const modules = await getModulesForService(serviceId);
  const idx = modules.findIndex((m) => m.id === moduleId);
  if (idx === -1) notFound();

  const mod = modules[idx];
  const prev = modules[idx - 1];
  const next = modules[idx + 1];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Back to class TOC */}
      <Link
        href={`/kelas-saya/${serviceId}`}
        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={2} /> {service.name}
      </Link>

      {/* Module rail */}
      <nav
        aria-label="Daftar modul"
        className="-mx-1 overflow-x-auto px-1 pb-1"
      >
        <ul className="flex w-max items-center gap-2">
          {modules.map((m, i) => {
            const isCurrent = m.id === moduleId;
            return (
              <li key={m.id}>
                <Link
                  href={`/kelas-saya/${serviceId}/${m.id}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={
                    "inline-flex min-h-[36px] items-center rounded-full px-3.5 text-xs font-semibold whitespace-nowrap transition-colors " +
                    (isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted hover:text-foreground")
                  }
                >
                  Modul {i + 1}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Module header */}
      <div className="space-y-1 border-b border-border pb-5">
        <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Modul {idx + 1} / {modules.length}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {mod.title}
        </h1>
        {mod.description && (
          <p className="max-w-[62ch] text-sm text-muted-foreground">
            {mod.description}
          </p>
        )}
      </div>

      {/* Big video */}
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
      {mod.materials.length > 0 && <ModuleMaterials materials={mod.materials} />}

      {/* Module with neither video nor materials */}
      {!mod.videoPath && mod.materials.length === 0 && (
        <p className="flex items-center gap-2 text-sm italic text-muted-foreground">
          <PlayCircle className="size-4" strokeWidth={2} /> Materi modul ini
          segera hadir ya, Ma.
        </p>
      )}

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        {prev ? (
          <Link
            href={`/kelas-saya/${serviceId}/${prev.id}`}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <ChevronLeft className="size-4" strokeWidth={2} /> Modul sebelumnya
          </Link>
        ) : (
          <Button variant="outline" size="lg" disabled>
            <ChevronLeft className="size-4" strokeWidth={2} /> Modul sebelumnya
          </Button>
        )}

        {next ? (
          <Link
            href={`/kelas-saya/${serviceId}/${next.id}`}
            className={buttonVariants({ size: "lg" })}
          >
            Modul berikutnya <ChevronRight className="size-4" strokeWidth={2} />
          </Link>
        ) : (
          <Button size="lg" disabled>
            Modul berikutnya <ChevronRight className="size-4" strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  );
}
