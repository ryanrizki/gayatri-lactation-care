import { getEstimatorConfig } from "@/lib/settings";
import EstimatorSettingsForm from "@/components/admin/EstimatorSettingsForm";

export default async function PengaturanPage() {
  const config = await getEstimatorConfig();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Pengaturan
        </h1>
        <p className="text-sm text-muted-foreground">
          Atur tarif estimator biaya transport untuk layanan homecare.
        </p>
      </div>

      <EstimatorSettingsForm initial={config} />
    </div>
  );
}
