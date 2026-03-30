import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgresql://home_manager:home_manager@127.0.0.1:5432/home_manager?schema=public";
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as PrismaGlobal;

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
