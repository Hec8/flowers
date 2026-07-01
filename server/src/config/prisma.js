import { PrismaClient } from '@prisma/client';

const MAX_RETRIES = 3;

function isConnectionError(err) {
  return (
    err?.code === 'P1001' ||
    err?.code === 'P1002' ||
    err?.message?.includes("Can't reach database server") ||
    err?.message?.includes('Connection pool timeout') ||
    err?.message?.includes('Connection refused') ||
    err?.message?.includes('connect ECONNREFUSED')
  );
}

const basePrisma = new PrismaClient({ log: ['error'] });

/**
 * Prisma avec retry automatique sur les erreurs de connexion Neon.
 * Neon serverless peut couper la connexion après inactivité.
 * On retente jusqu'à 3 fois avec un délai croissant avant de propager l'erreur.
 */
const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      let attempts = 0;
      while (true) {
        try {
          return await query(args);
        } catch (err) {
          attempts += 1;
          if (!isConnectionError(err) || attempts >= MAX_RETRIES) throw err;

          const delay = 600 * attempts;
          console.warn(
            `[Prisma] ${model}.${operation} — connexion perdue (tentative ${attempts}/${MAX_RETRIES}), retry dans ${delay}ms...`,
          );
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    },
  },
});

export default prisma;
