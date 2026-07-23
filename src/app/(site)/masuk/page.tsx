import { LoginFormReal } from "@/components/AuthForms";

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return (
    <div className="max-w-md mx-auto py-10">
      <LoginFormReal callbackUrl={callbackUrl ?? "/kelas-saya"} />
    </div>
  );
}
