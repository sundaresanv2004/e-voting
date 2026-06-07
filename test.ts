import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.candidate.findFirst({ where: { name: "Sundar" } });
  console.log(c);
}
main().finally(() => prisma.$disconnect());
