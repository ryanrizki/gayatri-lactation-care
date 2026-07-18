import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServiceForEdit } from "@/lib/services-admin";
import { updateService } from "@/lib/admin-actions";
import ServiceForm from "@/components/admin/ServiceForm";

export default async function EditLayananPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceForEdit(id);
  if (!service) notFound();

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
            Edit Layanan
          </h1>
          <p className="text-sm text-muted-foreground">
            Perbarui detail untuk {service.name}.
          </p>
        </div>
      </div>

      <ServiceForm
        action={updateService.bind(null, id)}
        initial={{
          name: service.name,
          category: service.category,
          price: service.price,
          description: service.description,
          features: service.features,
          image: service.image,
          sortOrder: service.sortOrder,
          active: service.active,
        }}
        submitLabel="Simpan"
      />
    </div>
  );
}
