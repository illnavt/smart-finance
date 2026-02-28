// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Buat koneksi native Node.js ke PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Bungkus dengan adapter Prisma
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Masukkan adapter ke dalam PrismaClient (Ini yang diwajibkan oleh Prisma v7)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;