import { notFound } from "next/navigation";
import { SERVICE_PACKAGES } from "@/data/challengesData";
import { findPackage } from "@/services/serviceConfig";
import ServiceDetail from "@/services/ServiceDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PACKAGES.map((p) => ({ id: p.id }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!findPackage(id)) notFound();

  return <ServiceDetail />;
}
