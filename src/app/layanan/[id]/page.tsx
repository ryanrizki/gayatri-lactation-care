import { notFound } from "next/navigation";
import ServiceDetail from "@/services/ServiceDetail";
import { getService, getServiceIds } from "@/lib/services";

export async function generateStaticParams() {
  const ids = await getServiceIds();
  return ids.map((id) => ({ id }));
}

export const dynamicParams = false;

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
