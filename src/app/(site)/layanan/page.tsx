import ServiceList from "@/services/ServiceList";
import { getServices } from "@/lib/services";

export default async function LayananPage() {
  const services = await getServices();
  return <ServiceList services={services} />;
}
