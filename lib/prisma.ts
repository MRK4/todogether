import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Permet d'éviter de recréer des instances PrismaClient en mode dev
// (Next.js recharge souvent les modules).
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  // Évite l'avertissement pg-connection-string : sslmode=require/prefer/verify-ca
  // adopte verify-full pour garder le même comportement SSL strict.
  connectionString = connectionString.replace(
    /(sslmode=)(require|prefer|verify-ca)(&|$)/g,
    "$1verify-full$3"
  );
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prismaClient = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;
export default prisma;

