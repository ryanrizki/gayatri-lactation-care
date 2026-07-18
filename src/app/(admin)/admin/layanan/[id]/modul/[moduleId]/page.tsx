import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getModule } from "@/lib/modules-admin";
import { updateModuleAction } from "@/lib/module-actions";
import ModuleForm from "@/components/admin/ModuleForm";
import MaterialManager from "@/components/admin/MaterialManager";

export default async function ModulEditPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>;
}) {
  const { id, moduleId } = await params;
  const mod = await getModule(moduleId);
  if (!mod) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <Link
          href={`/admin/layanan/${id}/modul`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
          Kembali ke daftar modul
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit Modul
          </h1>
          <p className="text-sm text-muted-foreground">
            Perbarui detail modul dan kelola materinya.
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Detail Modul</h2>
        <ModuleForm
          action={updateModuleAction.bind(null, moduleId, id)}
          initial={{
            title: mod.title,
            description: mod.description,
            isPreview: mod.isPreview,
            durationSec: mod.durationSec,
            videoPath: mod.videoPath,
          }}
          submitLabel="Simpan Perubahan"
        />
      </section>

      <MaterialManager
        moduleId={moduleId}
        serviceId={id}
        materials={mod.materials}
      />
    </div>
  );
}
