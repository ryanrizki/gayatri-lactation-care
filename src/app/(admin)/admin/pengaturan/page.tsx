import { getEstimatorConfig, getPaymentSettings } from "@/lib/settings";
import EstimatorSettingsForm from "@/components/admin/EstimatorSettingsForm";
import PaymentSettingsForm from "@/components/admin/PaymentSettingsForm";

export default async function PengaturanPage() {
  const [config, payment] = await Promise.all([
    getEstimatorConfig(),
    getPaymentSettings(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Pengaturan
        </h1>
        <p className="text-sm text-muted-foreground">
          Atur tarif estimator biaya transport dan info pembayaran kelas.
        </p>
      </div>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Estimator Transport
          </h2>
          <p className="text-sm text-muted-foreground">
            Tarif biaya transport untuk layanan homecare.
          </p>
        </div>
        <EstimatorSettingsForm initial={config} />
      </section>

      <section className="space-y-4 border-t border-border pt-10">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Info Pembayaran
          </h2>
          <p className="text-sm text-muted-foreground">
            Rekening tujuan transfer dan nomor WhatsApp yang tampil ke Mama saat
            membeli kelas.
          </p>
        </div>
        <PaymentSettingsForm initial={payment} />
      </section>
    </div>
  );
}
