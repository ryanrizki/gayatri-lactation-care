import { notFound } from "next/navigation";
import ServiceBooking from "@/services/ServiceBooking";
import { getService } from "@/lib/services";
import { auth } from "@/auth";
import { getEnrollment } from "@/lib/enrollments";
import { getPaymentSettings } from "@/lib/settings";

export default async function ServiceBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getService(id);
  if (!pkg) notFound();

  if (pkg.category === "class") {
    const session = await auth();
    const enrollmentStatus = session?.user?.id
      ? ((await getEnrollment(session.user.id, id))?.status ?? null)
      : null;
    const payment = await getPaymentSettings();
    return (
      <ServiceBooking
        pkg={pkg}
        enrollmentStatus={enrollmentStatus}
        payment={payment}
      />
    );
  }

  return <ServiceBooking pkg={pkg} />;
}
