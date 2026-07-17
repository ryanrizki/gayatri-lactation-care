import Dashboard from "@/components/Dashboard";
import { getChallenges } from "@/lib/challenges";
import { getServices } from "@/lib/services";

export default async function HomePage() {
  const [challenges, services] = await Promise.all([getChallenges(), getServices()]);
  return <Dashboard challenges={challenges} services={services} />;
}
