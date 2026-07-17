import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL dan ADMIN_PASSWORD wajib di .env");
  }
  const passwordHash = await hash(password);
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { role: "ADMIN", passwordHash, nama: "Admin Gayatri" },
    create: { email: email.toLowerCase(), passwordHash, nama: "Admin Gayatri", role: "ADMIN" },
  });
  console.log(`Admin siap: ${user.email} (role ${user.role})`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
