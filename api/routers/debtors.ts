import { z } from "zod";
import { eq, desc, sql, and, ilike } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { debtors } from "@db/schema";

export const debtorsRouter = createRouter({
  // Получить список должников с пагинацией и фильтрами
  list: publicQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        region: z.string().optional(),
        debtorType: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const {
        page = 1,
        limit = 20,
        search,
        region,
        debtorType,
      } = input || {};

      const conditions = [];

      if (search) {
        conditions.push(ilike(debtors.name, `%${search}%`));
      }
      if (region) {
        conditions.push(eq(debtors.region, region));
      }
      if (debtorType) {
        conditions.push(eq(debtors.debtorType, debtorType));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(debtors)
          .where(where)
          .orderBy(desc(debtors.createdAt))
          .limit(limit)
          .offset((page - 1) * limit),
        db
          .select({ count: sql<number>`count(*)` })
          .from(debtors)
          .where(where),
      ]);

      return {
        items,
        total: countResult[0]?.count ?? 0,
        page,
        limit,
      };
    }),

  // Получить должника по ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(debtors)
        .where(eq(debtors.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),
});
