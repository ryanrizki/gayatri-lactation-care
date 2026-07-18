import { notFound } from "next/navigation";
import ServiceDetail from "@/services/ServiceDetail";
import { getService } from "@/lib/services";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getService(id);
  if (!pkg) notFound();
  return <ServiceDetail pkg={pkg} />;
}
