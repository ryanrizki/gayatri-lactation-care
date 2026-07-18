import { notFound } from "next/navigation";
import ServiceBooking from "@/services/ServiceBooking";
import { getService, getServiceIds } from "@/lib/services";

export async function generateStaticParams() {
  const ids = await getServiceIds();
  return ids.map((id) => ({ id }));
}

export const dynamicParams = false;

export default async function ServiceBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getService(id);
  if (!pkg) notFound();
  return <ServiceBooking pkg={pkg} />;
}
