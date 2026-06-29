import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '$env/static/private';

// Ensure DATABASE_URL is set
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const globalForPrisma = globalThis as unknown as { db: PrismaClient | undefined };

export const db =
  globalForPrisma.db ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'query'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.db = db;