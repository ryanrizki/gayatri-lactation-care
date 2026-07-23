import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, PlayCircle, FileText, ChevronRight, BookOpen } from "lucide-react";
import { auth } from "@/auth";
import { hasPaidEnrollment } from "@/lib/access";
import { getService } from "@/lib/services";
import { getModulesForService } from "@/lib/modules-admin";

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
        <ul className="space-y-3">
          {modules.map((mod, i) => (
            <li key={mod.id}>
              <Link
                href={`/kelas-saya/${serviceId}/${mod.id}`}
                className="group relative flex items-start gap-3 overflow-hidden rounded-2xl border border-[#F3D6E2] bg-card p-4 pl-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#F3D6E2] hover:shadow-md sm:gap-4 sm:p-6 sm:pl-7"
              >
                {/* Left accent bar */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#F8B6D2] to-[#D85C99]"
                />

                {/* Icon + number badge on tinted circle */}
                <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[#F3D6E2] bg-[#FCE9F1] transition-transform group-hover:scale-105">
                  <BookOpen className="size-5 text-[#D85C99]" strokeWidth={2} />
                  <span className="absolute -right-1 -top-1 inline-flex size-5 items-center justify-center rounded-full bg-[#3E2A38] text-[10px] font-bold text-white ring-2 ring-card">
                    {i + 1}
                  </span>
                </span>

                <div className="min-w-0 flex-1 space-y-1 pt-0.5">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-[#D85C99]">
                    Modul {i + 1}
                  </span>
                  <h2 className="text-lg font-semibold leading-snug text-[#3E2A38]">
                    {mod.title}
                  </h2>
                  {mod.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {mod.description}
                    </p>
                  )}

                  {/* Meta chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-medium">
                    {mod.videoPath && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FCE9F1] px-2.5 py-1 text-[#8B4A6E]">
                        <PlayCircle className="size-3.5" strokeWidth={2} /> Video
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                      <FileText className="size-3.5" strokeWidth={2} />{" "}
                      {mod.materials.length} materi
                    </span>
                  </div>
                </div>

                <ChevronRight
                  className="size-5 shrink-0 self-center text-[#D85C99] transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
