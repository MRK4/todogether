import { PrismaClient } from "@/lib/generated/prisma";

// Permet d'éviter de recréer des instances PrismaClient en mode dev
// (Next.js recharge souvent les modules).
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;
export default prisma;

