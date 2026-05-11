import { relations } from "drizzle-orm";
import { debtors, auctionNotices, lots } from "./schema";

export const debtorsRelations = relations(debtors, ({ many }) => ({
  auctionNotices: many(auctionNotices),
}));

export const auctionNoticesRelations = relations(auctionNotices, ({ one, many }) => ({
  debtor: one(debtors, {
    fields: [auctionNotices.debtorId],
    references: [debtors.id],
  }),
  lots: many(lots),
}));

export const lotsRelations = relations(lots, ({ one }) => ({
  notice: one(auctionNotices, {
    fields: [lots.noticeId],
    references: [auctionNotices.id],
  }),
}));
