import "dotenv/config";

import { prisma } from "./client";

const DEFAULT_USERS = [
  {
    email: "admin@example.com",
    name: "Admin User",
    role: "ADMIN" as const,
  },
];

async function main() {
  for (const user of DEFAULT_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
