import { z } from "zod";
import { eq, desc, sql, and, gte, lte, ilike } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { lots } from "@db/schema";

export const lotsRouter = createRouter({
  // Получить список лотов с пагинацией и фильтрами
  list: publicQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(500).default(20),
        category: z.string().optional(),
        status: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const {
        page = 1,
        limit = 20,
        category,
        status,
        minPrice,
        maxPrice,
        search,
      } = input || {};

      const conditions = [];

      if (category) {
        conditions.push(eq(lots.category, category));
      }
      if (status) {
        conditions.push(eq(lots.status, status));
      }
      if (minPrice !== undefined) {
        conditions.push(gte(lots.startPrice, minPrice.toString()));
      }
      if (maxPrice !== undefined) {
        conditions.push(lte(lots.startPrice, maxPrice.toString()));
      }
      if (search) {
        conditions.push(ilike(lots.description, `%${search}%`));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(lots)
          .where(where)
          .orderBy(desc(lots.createdAt))
          .limit(limit)
          .offset((page - 1) * limit),
        db
          .select({ count: sql<number>`count(*)` })
          .from(lots)
          .where(where),
      ]);

      return {
        items,
        total: countResult[0]?.count ?? 0,
        page,
        limit,
      };
    }),

  // Получить лот по ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(lots)
        .where(eq(lots.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),
});
