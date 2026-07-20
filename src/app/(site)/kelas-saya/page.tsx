import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenCheck, ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import { auth } from "@/auth";
import { getPaidEnrollments } from "@/lib/access";

export const metadata = {
  title: "Kelas Saya — Gayatri",
};

export default async function KelasSayaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk?callbackUrl=/kelas-saya");

  const enrollments = await getPaidEnrollments(session.user.id);
  const firstName = session.user.name?.split(" ")[0] ?? "Mama";

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Heading + warm intro */}
      <header className="space-y-2 border-b border-[#F3D6E2]/50 pb-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D85C99] bg-[#FDEAF2] px-3.5 py-1 rounded-full uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" /> Ruang Belajar Mama
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-[#3E2A38] leading-tight">
          Kelas Saya
        </h1>
        <p className="text-sm sm:text-base text-[#5E4455] leading-relaxed max-w-[60ch]">
          Halo, {firstName}. Ini semua kelas yang sudah Mama miliki. Materi dan
          videonya bisa dibuka kapan saja, sesuai waktu Mama. Selamat belajar ya 🌸
        </p>
      </header>

      {enrollments.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center text-center gap-4 bg-white border border-[#F3D6E2] rounded-3xl px-6 py-14 sm:py-20">
          <div className="w-16 h-16 bg-[#FCE9F1] border border-[#F3D6E2] rounded-full flex items-center justify-center text-[#D85C99]">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-display font-bold text-[#3E2A38]">
              Mama belum punya kelas
            </h2>
            <p className="text-sm text-[#5E4455] leading-relaxed max-w-[42ch] mx-auto">
              Belum ada kelas yang Mama ikuti. Yuk lihat pilihan kelas kami untuk
              menemani perjalanan menyusui Mama.
            </p>
          </div>
          <Link
            href="/layanan"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-full text-sm font-bold bg-[#3E2A38] hover:bg-[#E97FB1] text-white transition-colors shadow-sm"
          >
            <span>Lihat Pilihan Kelas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Grid of purchased classes */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {enrollments.map(({ service }) => (
            <Link
              key={service.id}
              href={`/kelas-saya/${service.id}`}
              className="group flex flex-col bg-white border border-[#F3D6E2] rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F8B6D2] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E97FB1] focus-visible:ring-offset-2"
            >
              <div className="relative">
                <img
                  src={service.image}
                  alt={service.name}
                  loading="lazy"
                  className="w-full h-36 sm:h-40 object-cover"
                />
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border bg-white/90 text-[#4D6B4E] border-[#CCDDC8] backdrop-blur">
                  <BookOpenCheck className="w-3.5 h-3.5" /> Akses Aktif
                </span>
              </div>
              <div className="flex flex-col flex-1 p-4 sm:p-5 gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-[#3E2A38] leading-snug line-clamp-2">
                  {service.name}
                </h2>
                <p className="text-sm text-[#5E4455] leading-relaxed line-clamp-2 flex-1">
                  {service.description}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-[#D85C99] group-hover:gap-2.5 transition-all">
                  Buka Kelas <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
