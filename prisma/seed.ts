import { PrismaClient, Prisma } from "@prisma/client";
import { SERVICE_PACKAGES, CHALLENGES_DATA } from "../src/data/challengesData";

const prisma = new PrismaClient();

// Konstanta tarif estimator (disalin dari src/services/estimator.ts Fase 1).
const ESTIMATOR_CONFIG = {
  freeRadiusKm: 5,
  feePerKm: 6000,
  baseTransportFee: 15000,
};

async function main() {
  for (const [i, pkg] of SERVICE_PACKAGES.entries()) {
    await prisma.service.upsert({
      where: { id: pkg.id },
      update: {
        name: pkg.name,
        category: pkg.category,
        price: pkg.price,
        description: pkg.description,
        features: pkg.features,
        image: pkg.image,
        materials: (pkg.materials as unknown as Prisma.InputJsonValue) ?? undefined,
        sortOrder: i,
      },
      create: {
        id: pkg.id,
        name: pkg.name,
        category: pkg.category,
        price: pkg.price,
        description: pkg.description,
        features: pkg.features,
        image: pkg.image,
        materials: (pkg.materials as unknown as Prisma.InputJsonValue) ?? undefined,
        sortOrder: i,
      },
    });
  }

  for (const [i, c] of CHALLENGES_DATA.entries()) {
    await prisma.challenge.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        icon: c.icon,
        description: c.description,
        criticalSymptoms: c.criticalSymptoms,
        immediateSteps: c.immediateSteps,
        interactiveDiagnostic: c.interactiveDiagnostic as unknown as Prisma.InputJsonValue,
        sortOrder: i,
      },
      create: {
        id: c.id,
        title: c.title,
        icon: c.icon,
        description: c.description,
        criticalSymptoms: c.criticalSymptoms,
        immediateSteps: c.immediateSteps,
        interactiveDiagnostic: c.interactiveDiagnostic as unknown as Prisma.InputJsonValue,
        sortOrder: i,
      },
    });
  }

  await prisma.setting.upsert({
    where: { key: "estimator" },
    update: { value: ESTIMATOR_CONFIG },
    create: { key: "estimator", value: ESTIMATOR_CONFIG },
  });

  const [svc, ch] = await Promise.all([prisma.service.count(), prisma.challenge.count()]);
  console.log(`Seeded ${svc} services, ${ch} challenges, 1 setting.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
