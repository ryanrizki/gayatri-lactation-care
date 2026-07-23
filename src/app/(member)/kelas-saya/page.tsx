import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenCheck, ArrowRight, GraduationCap } from "lucide-react";
import { auth } from "@/auth";
import { getPaidEnrollments } from "@/lib/access";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Kelas Saya — Gayatri",
};

export default async function KelasSayaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk?callbackUrl=/kelas-saya");

  const enrollments = await getPaidEnrollments(session.user.id);
  const firstName = session.user.name?.split(" ")[0] ?? "Mama";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Kelas Saya
        </h1>
        <p className="text-sm text-muted-foreground">
          Halo, {firstName}. Ini semua kelas yang sudah Mama miliki. Materi dan
          videonya bisa dibuka kapan saja, sesuai waktu Mama.
        </p>
      </div>

      {enrollments.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-14 text-center sm:py-20">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <GraduationCap className="size-8" strokeWidth={2} />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold">Mama belum punya kelas</h2>
            <p className="mx-auto max-w-[42ch] text-sm text-muted-foreground">
              Belum ada kelas yang Mama ikuti. Yuk lihat pilihan kelas kami untuk
              menemani perjalanan menyusui Mama.
            </p>
          </div>
          <Link href="/layanan" className={buttonVariants({ size: "lg" })}>
            Lihat Pilihan Kelas
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
        </div>
      ) : (
        /* Grid of purchased classes */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {enrollments.map(({ service }) => (
            <Link
              key={service.id}
              href={`/kelas-saya/${service.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="relative">
                <img
                  src={service.image}
                  alt={service.name}
                  loading="lazy"
                  className="h-36 w-full object-cover sm:h-40"
                />
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                  <BookOpenCheck className="size-3.5" strokeWidth={2} /> Akses Aktif
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                <h2 className="line-clamp-2 text-base font-semibold leading-snug sm:text-lg">
                  {service.name}
                </h2>
                <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {service.description}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Buka Kelas
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
