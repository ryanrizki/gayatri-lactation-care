import { notFound } from "next/navigation";
import ServiceDetail from "@/services/ServiceDetail";
import { getService } from "@/lib/services";
import { getModulesForService } from "@/lib/modules-admin";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getService(id);
  if (!pkg) notFound();
  const modules = pkg.category === "class" ? await getModulesForService(id) : [];
  return <ServiceDetail pkg={pkg} modules={modules} />;
}
