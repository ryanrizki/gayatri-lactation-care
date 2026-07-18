import { notFound } from "next/navigation";
import ServiceBooking from "@/services/ServiceBooking";
import { getService } from "@/lib/services";

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
