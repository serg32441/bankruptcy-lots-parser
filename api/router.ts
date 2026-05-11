import { createRouter, publicQuery } from "./middleware";
import { lotsRouter } from "./routers/lots";
import { debtorsRouter } from "./routers/debtors";
import { auctionNoticesRouter } from "./routers/auctionNotices";
import { parserRouter } from "./routers/parser";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  lots: lotsRouter,
  debtors: debtorsRouter,
  auctionNotices: auctionNoticesRouter,
  parser: parserRouter,
});

export type AppRouter = typeof appRouter;
