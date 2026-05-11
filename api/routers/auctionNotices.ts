import { z } from "zod";
import { eq, desc, sql, and, ilike } from "drizzle-orm";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { auctionNotices } from "@db/schema";

export const auctionNoticesRouter = createRouter({
  // Получить список объявлений с пагинацией и фильтрами
  list: publicQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        propertyCategory: z.string().optional(),
        isActive: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const {
        page = 1,
        limit = 20,
        search,
        propertyCategory,
        isActive,
      } = input || {};

      const conditions = [];

      if (search) {
        conditions.push(ilike(auctionNotices.lotDescription, `%${search}%`));
      }
      if (propertyCategory) {
        conditions.push(eq(auctionNotices.propertyCategory, propertyCategory));
      }
      if (isActive !== undefined) {
        conditions.push(eq(auctionNotices.isActive, isActive));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(auctionNotices)
          .where(where)
          .orderBy(desc(auctionNotices.publishDate))
          .limit(limit)
          .offset((page - 1) * limit),
        db
          .select({ count: sql<number>`count(*)` })
          .from(auctionNotices)
          .where(where),
      ]);

      return {
        items,
        total: countResult[0]?.count ?? 0,
        page,
        limit,
      };
    }),

  // Получить объявление по ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(auctionNotices)
        .where(eq(auctionNotices.id, input.id))
        .limit(1);

      return result[0] ?? null;
    }),
});
