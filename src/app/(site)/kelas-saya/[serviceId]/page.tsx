import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  PlayCircle,
  FileText,
  Video,
  ExternalLink,
  Download,
  Sparkles,
} from "lucide-react";
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

  const typeBadge: Record<string, { label: string; Icon: typeof FileText }> = {
    PDF: { label: "PDF", Icon: FileText },
    VIDEO: { label: "Video", Icon: Video },
    LINK: { label: "Tautan", Icon: ExternalLink },
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/kelas-saya"
        className="inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-[#836E7A] hover:text-[#3E2A38] transition"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Kelas Saya
      </Link>

      {/* Class title + description */}
      <header className="space-y-2 border-b border-[#F3D6E2]/50 pb-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D85C99] bg-[#FDEAF2] px-3.5 py-1 rounded-full uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" /> Materi Kelas
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-[#3E2A38] leading-tight">
          {service.name}
        </h1>
        {service.description && (
          <p className="text-sm sm:text-base text-[#5E4455] leading-relaxed max-w-[62ch]">
            {service.description}
          </p>
        )}
      </header>

      {modules.length === 0 ? (
        <div className="bg-white border border-[#F3D6E2] rounded-3xl px-6 py-14 text-center">
          <p className="text-sm text-[#5E4455] leading-relaxed">
            Materi kelas segera hadir ya, Ma. Tim kami sedang menyiapkannya
            dengan sepenuh hati 🌸
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {modules.map((mod, i) => (
            <section
              key={mod.id}
              className="bg-white border border-[#F3D6E2] rounded-3xl p-4 sm:p-6 space-y-4"
            >
              {/* Module header */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FCE9F1] border border-[#F3D6E2] text-sm font-black text-[#D85C99]">
                  {i + 1}
                </span>
                <div className="space-y-1 pt-0.5">
                  <span className="block text-xs font-bold uppercase tracking-wide text-[#9C8593]">
                    Modul {i + 1}
                  </span>
                  <h2 className="text-lg font-display font-bold text-[#3E2A38] leading-snug">
                    {mod.title}
                  </h2>
                  {mod.description && (
                    <p className="text-sm text-[#5E4455] leading-relaxed">
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
                  className="w-full rounded-2xl bg-black aspect-video border border-[#F3D6E2]"
                >
                  Peramban Mama belum mendukung pemutar video.
                </video>
              )}

              {/* Materials */}
              {mod.materials.length > 0 && (
                <ul className="space-y-2.5">
                  {mod.materials.map((mat) => {
                    const badge = typeBadge[mat.type] ?? typeBadge.LINK;
                    const isLink = mat.type === "LINK";
                    const href = isLink
                      ? (mat.filePath ?? "#")
                      : `/api/material/${mat.id}`;
                    const ActionIcon = isLink ? ExternalLink : Download;
                    const actionLabel = isLink ? "Buka" : "Buka / Unduh";
                    return (
                      <li key={mat.id}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 min-h-[56px] px-4 py-3 rounded-2xl bg-[#FFF6FA] border border-[#F3D6E2] hover:bg-white hover:border-[#F8B6D2] transition group"
                        >
                          <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-[#F3D6E2] text-[#D85C99]">
                            <badge.Icon className="w-4 h-4" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold text-[#3E2A38] leading-snug truncate">
                              {mat.title}
                            </span>
                            <span className="text-xs font-semibold text-[#9C8593]">
                              {badge.label}
                            </span>
                          </span>
                          <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#B85C8A] group-hover:text-[#D85C99] transition">
                            <ActionIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">{actionLabel}</span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Module with neither video nor materials */}
              {!mod.videoPath && mod.materials.length === 0 && (
                <p className="flex items-center gap-2 text-sm text-[#9C8593] italic">
                  <PlayCircle className="w-4 h-4" /> Materi modul ini segera hadir ya, Ma.
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
