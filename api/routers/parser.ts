import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { debtors, auctionNotices, lots } from "@db/schema";
import { sql } from "drizzle-orm";
import { searchMessages } from "../lib/fedresurs";

const REGIONS = [
  "Москва", "Московская область", "Санкт-Петербург", "Ленинградская область",
  "Ростовская область", "Краснодарский край", "Свердловская область",
  "Нижегородская область", "Самарская область", "Челябинская область",
  "Республика Татарстан", "Башкортостан", "Красноярский край",
  "Пермский край", "Воронежская область",
];

const COMPANY_NAMES = [
  'ООО "СтройИнвест"', 'ООО "ТехноПром"', 'ООО "ГлобалТрейд"', 'ООО "АльфаСтрой"',
  'ООО "МегаЛогистика"', 'ООО "ФинСервис"', 'ООО "ИнТех"', 'ООО "ЮниПром"',
  'ООО "АгроКомплекс"', 'ООО "ЭнергоСбыт"', 'ООО "СтройГрупп"', 'ООО "Транзит"',
  'ООО "ПищПром"', 'ООО "ХимСервис"', 'ООО "МеталлТорг"', 'ООО "ЛогистикПро"',
  'ООО "СтройМонтаж"', 'ООО "АвтоГрупп"', 'ООО "ПромСнаб"', 'ООО "ФудСервис"',
  'АО "ПромТех"', 'АО "ИнвестХолдинг"', 'ПАО "СтройКорп"', 'АО "ФинГрупп"',
];

const DESCRIPTIONS = [
  "Право требования задолженности по договору поставки №1523 от 15.03.2023. Задолжник: ООО «Ромашка». Сумма задолженности: 2 450 000 руб. Основание: неоплата поставленной продукции.",
  "Дебиторская задолженность по договору оказания услуг №892 от 10.01.2023. Задолжник: ИП Иванов И.И. Сумма долга: 1 200 000 руб. Просрочка: 180 дней.",
  "Право требования по кредитному договору №45-2022. Заемщик: ООО «СтройМастер». Остаток задолженности: 8 500 000 руб. Обеспечение: поручительство.",
  "Дебиторская задолженность за арендные платежи по договору аренды №77 от 01.06.2022. Арендатор: ООО «ТехноСфера». Сумма задолженности: 3 750 000 руб.",
  "Право требования по договору подряда №334/2023. Заказчик: АО «ИнвестПроект». Неоплаченные работы: проектирование. Сумма: 5 100 000 руб.",
  "Дебиторская задолженность за поставку оборудования по спецификации №12. Покупатель: ООО «ПромСнаб». Сумма долга: 1 890 000 руб. Пеня начислена.",
  "Право требования по договору займа №ZG-2023-45. Заемщик: ООО «ФинЛайн». Основной долг: 12 000 000 руб. Проценты: 1 200 000 руб.",
  "Дебиторская задолженность за коммунальные услуги за период 2022-2023 гг. Должник: ООО «БизнесЦентр». Сумма: 980 000 руб.",
  "Право требования по договору франшизы №FR-88. Франчайзи: ИП Петрова А.С. Задолженность по роялти: 450 000 руб.",
  "Дебиторская задолженность за выполненные строительные работы по акту №15 от 20.09.2023. Заказчик: ООО «Девелопмент». Сумма: 7 300 000 руб.",
  "Право требования по векселю серии ВТ №0012563. Векселедатель: ООО «ТоргСервис». Номинал: 3 200 000 руб.",
  "Дебиторская задолженность за лицензионные платежи по договору лицензии №L-2023-15. Лицензиат: ООО «СофтИнж». Сумма: 890 000 руб.",
  "Право требования по договору перевода долга №PD-44. Новый должник: ООО «МегаСтрой». Сумма долга: 15 000 000 руб.",
  "Дебиторская задолженность за оказанные консультационные услуги. Клиент: АО «КорпФинанс». Сумма: 2 100 000 руб. Акт подписан.",
  "Право требования по гарантийному письму о погашении задолженности. Должник: ООО «РитейлГрупп». Сумма: 6 700 000 руб.",
  "Дебиторская задолженность за поставку сырья по контракту №S-223. Покупатель: ООО «ПищПром». Сумма: 4 400 000 руб.",
  "Право требования по договору факторинга №F-77. Дебитор: ООО «ЛогистикПро». Сумма уступленных требований: 9 800 000 руб.",
  "Дебиторская задолженность по договору аренды оборудования. Арендатор: ООО «СтройТех». Просрочка арендных платежей: 3 150 000 руб.",
  "Право требования по договору поставки №678/2023. Покупатель: ООО «АвтоДилер». Задолженность за автозапчасти: 5 600 000 руб.",
  "Дебиторская задолженность по договору менеджмента. Клиент: ООО «ТоргЦентр». Сумма: 1 750 000 руб.",
  "Право требования по договору поставки стройматериалов №2023-456. Покупатель: ООО «РемСтрой». Сумма задолженности: 3 840 000 руб.",
  "Дебиторская задолженность за транспортные услуги по договору №Т-2023/88. Должник: ООО «КаргоМакс». Сумма: 2 670 000 руб.",
  "Право требования по договору цессии №Ц-44/2023. Первоначальный кредитор: АО «ПромБанк». Сумма уступленных прав: 18 500 000 руб.",
  "Дебиторская задолженность за IT-услуги по договору №ИТ-2023-12. Должник: ООО «ДиджиталПро». Сумма: 1 320 000 руб.",
  "Право требования по договору поставки продуктов питания №П-2023-99. Покупатель: ООО «РозницаМаркет». Сумма: 990 000 руб.",
];

const DEBTORS_DESC = [
  "Должник: ООО «Ромашка»",
  "Должник: ИП Иванов И.И.",
  "Заемщик: ООО «СтройМастер»",
  "Арендатор: ООО «ТехноСфера»",
  "Заказчик: АО «ИнвестПроект»",
  "Покупатель: ООО «ПромСнаб»",
  "Заемщик: ООО «ФинЛайн»",
  "Должник: ООО «БизнесЦентр»",
  "Франчайзи: ИП Петрова А.С.",
  "Заказчик: ООО «Девелопмент»",
  "Векселедатель: ООО «ТоргСервис»",
  "Лицензиат: ООО «СофтИнж»",
  "Новый должник: ООО «МегаСтрой»",
  "Клиент: АО «КорпФинанс»",
  "Должник: ООО «РитейлГрупп»",
];

const DEBT_TYPES = [
  "Поставка товаров",
  "Оказание услуг",
  "Договор займа",
  "Аренда",
  "Договор подряда",
  "Кредитный договор",
  "Вексель",
  "Факторинг",
  "Цессия",
  "Транспортные услуги",
];

const MANAGERS = [
  "Иванов С.П.", "Петрова А.В.", "Сидоров М.К.", "Кузнецова Е.Д.",
  "Смирнов И.А.", "Попова Н.С.", "Васильев Д.Г.", "Соколова О.В.",
  "Михайлов Р.Т.", "Новикова Л.П.", "Федоров А.С.", "Морозова К.М.",
];

const ORGANIZERS = [
  "ООО «Сбербанк-АСТ»", "ООО «Радмир Экспо»", "АО «Единая Электронная Торговая Площадка»",
  "НЭО Сфера", "ООО «Центр Реализации»", "АО «Тендерная Площадка»", "ООО «ЭТП ГПБ»",
];

const ETPS = [
  "Sberbank-AST", "Fabrikant", "RTS-Tender", "OTC.ru",
  "B2B-Center", "ETP GPB", "Roseltorg",
];

const AUCTION_STAGES = ["Первые торги", "Повторные торги", "Публичное предложение"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPrice(min: number, max: number): string {
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

function generateINN(): string {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
}

function generateOGRN(): string {
  return Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join("");
}

function generateCaseNumber(): string {
  const regions = ["40", "77", "78", "61", "23", "66", "16", "02", "24", "54"];
  return `А${randomItem(regions)}-${randomInt(10000, 99999)}/${randomInt(2019, 2024)}`;
}

// Extract face value from description using regex
function extractFaceValue(description: string): string | null {
  const patterns = [
    /(?:сумма|номинал|остаток|долг)[^:]*:\s*([\d\s]+(?:,\d+)?)\s*(?:руб|₽)/gi,
    /(\d[\d\s]{4,})\s*(?:руб|₽)/gi,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(description);
    if (match) {
      const val = match[1].replace(/\s/g, "");
      const num = parseInt(val);
      if (!isNaN(num) && num > 100000) return num.toString();
    }
  }
  return null;
}

// Detect debt type from description
function detectDebtType(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes("займ") || lower.includes("кредит")) return "Займ/Кредит";
  if (lower.includes("аренд")) return "Аренда";
  if (lower.includes("подряд")) return "Подряд";
  if (lower.includes("поставк")) return "Поставка";
  if (lower.includes("вексел")) return "Вексель";
  if (lower.includes("факторинг")) return "Факторинг";
  if (lower.includes("цесси")) return "Цессия";
  if (lower.includes("услуг")) return "Услуги";
  return "Прочее";
}

export const parserRouter = createRouter({
  // Fetch real data from ЕФРСБ demo API
  fetchFromFedresurs: publicQuery
    .input(
      z.object({
        pageSize: z.number().min(1).max(100).default(20),
        page: z.number().min(0).default(0),
      }).optional()
    )
    .mutation(async ({ input }) => {
      const { pageSize = 20, page = 0 } = input || {};

      let fetchedMessages: Awaited<ReturnType<typeof searchMessages>>;
      try {
        fetchedMessages = await searchMessages({
          messageType: "Auction2",
          page,
          pageSize,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          message: `Ошибка подключения к ЕФРСБ: ${msg}`,
          imported: 0,
        };
      }

      const db = getDb();
      let imported = 0;
      const errors: string[] = [];

      for (const msg of fetchedMessages.messages) {
        try {
          // Upsert debtor
          let debtorId: number | null = null;
          if (msg.debtorName) {
            const existing = await db
              .select({ id: debtors.id })
              .from(debtors)
              .where(
                msg.debtorInn
                  ? sql`inn = ${msg.debtorInn}`
                  : sql`name = ${msg.debtorName}`
              )
              .limit(1);

            if (existing.length > 0) {
              debtorId = existing[0].id;
            } else {
              const inserted = await db.insert(debtors).values({
                externalId: `FED-${msg.guid || Date.now()}`,
                debtorType: "legal",
                name: msg.debtorName,
                inn: msg.debtorInn || null,
                ogrn: msg.debtorOgrn || null,
                region: msg.debtorRegion || null,
                caseNumber: msg.caseNumber || null,
                caseStatus: "active",
              }).returning({ id: debtors.id });
              debtorId = inserted[0].id;
            }
          }

          // Insert auction notice (skip if exists)
          const existingNotice = await db
            .select({ id: auctionNotices.id })
            .from(auctionNotices)
            .where(sql`message_id = ${msg.guid}`)
            .limit(1);

          if (existingNotice.length > 0) continue;

          const description = msg.lots?.[0]?.description || "";
          const startPrice = msg.lots?.[0]?.startPrice?.toString() || "0";
          const depositVal = msg.lots?.[0]?.deposit?.toString() || "0";
          const stepVal = msg.lots?.[0]?.step?.toString() || "0";
          const faceValue = extractFaceValue(description);
          const debtType = detectDebtType(description);

          const noticeResult = await db.insert(auctionNotices).values({
            messageId: msg.guid || `FED-${Date.now()}-${Math.random()}`,
            debtorId,
            messageType: msg.messageType || "Auction2",
            messageNumber: msg.guid?.slice(0, 20) || "",
            publishDate: msg.publishDate ? new Date(msg.publishDate) : null,
            managerName: msg.managerName || null,
            organizerName: msg.organizerName || null,
            etp: msg.etp || null,
            bidStartDate: msg.bidStartDate ? new Date(msg.bidStartDate) : null,
            bidEndDate: msg.bidEndDate ? new Date(msg.bidEndDate) : null,
            auctionDate: msg.auctionDate ? new Date(msg.auctionDate) : null,
            auctionForm: msg.auctionForm || null,
            lotNumber: msg.lots?.[0]?.number || "1",
            lotDescription: description,
            propertyCategory: "debt",
            startPrice,
            auctionStep: stepVal,
            deposit: depositVal,
            currency: "RUB",
            fedresursUrl: `https://fedresurs.ru/message/${msg.guid}`,
            isActive: true,
            extraData: {
              faceValue,
              debtType,
              source: "fedresurs",
              stage: "Первые торги",
            },
          }).returning({ id: auctionNotices.id });

          // Insert lots
          for (const lot of msg.lots || [{ description, startPrice: parseFloat(startPrice) }]) {
            const lotPrice = lot.startPrice?.toString() || startPrice;
            const lotFaceValue = faceValue || lotPrice;
            await db.insert(lots).values({
              noticeId: noticeResult[0].id,
              lotNumber: lot.number || "1",
              description: lot.description || description,
              category: "debt",
              startPrice: lotPrice,
              currentPrice: lotPrice,
              step: lot.step ? `${lot.step}` : "5%",
              deposit: lot.deposit?.toString() || depositVal,
              status: "active",
            });
          }

          imported++;
        } catch (e) {
          errors.push(e instanceof Error ? e.message : String(e));
        }
      }

      return {
        success: true,
        message: `Импортировано ${imported} объявлений из ЕФРСБ (всего на сервере: ${fetchedMessages.total})`,
        imported,
        total: fetchedMessages.total,
        errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      };
    }),

  // Generate demo data
  generateDemoData: publicQuery
    .input(
      z.object({
        count: z.number().min(1).max(200).default(50),
      }).optional()
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const count = input?.count ?? 50;

      const existingCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(debtors);

      if (Number(existingCount[0]?.count ?? 0) > 0) {
        return {
          success: false,
          message: "База данных уже содержит данные. Очистите таблицы перед повторной генерацией.",
          existingCount: Number(existingCount[0]?.count ?? 0),
        };
      }

      const debtorIds: number[] = [];
      const now = new Date();

      for (let i = 0; i < count; i++) {
        const region = randomItem(REGIONS);
        const companyName = randomItem(COMPANY_NAMES);

        const result = await db.insert(debtors).values({
          externalId: `DEMO-${Date.now()}-${i}`,
          debtorType: "legal",
          name: companyName,
          inn: generateINN(),
          ogrn: generateOGRN(),
          region,
          address: `${region}, ул. Промышленная, д. ${randomInt(1, 150)}`,
          category: "Обычная организация",
          caseNumber: generateCaseNumber(),
          caseStatus: Math.random() > 0.3 ? "active" : "completed",
        }).returning({ id: debtors.id });

        debtorIds.push(result[0].id);
      }

      const noticeIds: number[] = [];
      for (let i = 0; i < count; i++) {
        const description = DESCRIPTIONS[i % DESCRIPTIONS.length];
        const stage = randomItem(AUCTION_STAGES);

        // Price depends on stage: 1st=full, 2nd=80%, public offer=20-60%
        let basePrice = randomInt(500_000, 30_000_000);
        let faceValue = Math.round(basePrice * randomInt(120, 400) / 100);
        if (stage === "Повторные торги") basePrice = Math.round(basePrice * 0.8);
        if (stage === "Публичное предложение") {
          const discount = randomInt(20, 70);
          basePrice = Math.round(faceValue * (100 - discount) / 100);
        }

        const startPrice = basePrice.toString();
        const deposit = Math.round(basePrice * 0.2).toString();
        const step = Math.round(basePrice * 0.05).toString();
        const publishDate = new Date(now.getTime() - randomInt(1, 60) * 86400000);
        const bidEndDate = new Date(publishDate.getTime() + randomInt(14, 45) * 86400000);

        const debtorPart = DEBTORS_DESC[i % DEBTORS_DESC.length];
        const fullDescription = `${description}\n${debtorPart}`;
        const debtType = detectDebtType(fullDescription);

        const result = await db.insert(auctionNotices).values({
          messageId: `DEMO-MSG-${Date.now()}-${i}`,
          debtorId: debtorIds[i % debtorIds.length],
          messageType: "Auction2",
          messageNumber: `${randomInt(1000000, 9999999)}`,
          publishDate,
          managerName: randomItem(MANAGERS),
          organizerName: randomItem(ORGANIZERS),
          etp: randomItem(ETPS),
          bidStartDate: publishDate,
          bidEndDate,
          auctionDate: bidEndDate,
          auctionForm: stage === "Публичное предложение" ? "Публичное предложение" : "Аукцион",
          lotNumber: `${randomInt(1, 50)}`,
          lotDescription: fullDescription,
          propertyCategory: "debt",
          startPrice,
          auctionStep: step,
          deposit,
          currency: "RUB",
          fedresursUrl: `https://fedresurs.ru/message/auction/${randomInt(100000000, 999999999)}`,
          isActive: Math.random() > 0.15,
          extraData: {
            faceValue: faceValue.toString(),
            debtType,
            stage,
            contactPhone: `+7 (${randomInt(900, 999)}) ${randomInt(100, 999)}-${randomInt(10, 99)}-${randomInt(10, 99)}`,
          },
        }).returning({ id: auctionNotices.id });

        noticeIds.push(result[0].id);
      }

      for (let i = 0; i < count; i++) {
        const noticeId = noticeIds[i % noticeIds.length];
        const notice = await db
          .select()
          .from(auctionNotices)
          .where(sql`id = ${noticeId}`)
          .limit(1);

        const n = notice[0];
        if (!n) continue;

        await db.insert(lots).values({
          noticeId,
          lotNumber: `${randomInt(1, 10)}`,
          description: n.lotDescription || DESCRIPTIONS[i % DESCRIPTIONS.length],
          category: "debt",
          startPrice: n.startPrice || "0",
          currentPrice: n.startPrice || "0",
          step: "5%",
          deposit: n.deposit || "0",
          status: randomItem(["active", "active", "active", "completed", "cancelled"]),
        });
      }

      return {
        success: true,
        message: `Создано ${count} должников, ${count} объявлений, ${count} лотов`,
        generated: { debtors: count, notices: count, lots: count },
      };
    }),

  // Get stats
  stats: publicQuery.query(async () => {
    const db = getDb();

    const [debtorsCount, noticesCount, lotsCount, activeLotsCount, totalValueResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(debtors),
      db.select({ count: sql<number>`count(*)` }).from(auctionNotices),
      db.select({ count: sql<number>`count(*)` }).from(lots),
      db.select({ count: sql<number>`count(*)` }).from(lots).where(sql`status = 'active'`),
      db.select({ total: sql<string>`coalesce(sum(cast(start_price as numeric)), 0)` }).from(lots).where(sql`status = 'active'`),
    ]);

    const totalValue = parseFloat(totalValueResult[0]?.total || "0");

    return {
      debtors: Number(debtorsCount[0]?.count ?? 0),
      notices: Number(noticesCount[0]?.count ?? 0),
      lots: Number(lotsCount[0]?.count ?? 0),
      activeLots: Number(activeLotsCount[0]?.count ?? 0),
      totalValue,
    };
  }),

  // Get analysis data
  analysis: publicQuery.query(async () => {
    const db = getDb();

    const notices = await db
      .select({
        startPrice: auctionNotices.startPrice,
        extraData: auctionNotices.extraData,
        publishDate: auctionNotices.publishDate,
        region: debtors.region,
      })
      .from(auctionNotices)
      .leftJoin(debtors, sql`${auctionNotices.debtorId} = ${debtors.id}`)
      .where(sql`${auctionNotices.propertyCategory} = 'debt' AND ${auctionNotices.isActive} = true`)
      .limit(500);

    type StageMap = Record<string, number>;
    type TypeMap = Record<string, number>;
    type RegionMap = Record<string, number>;

    const stageBreakdown: StageMap = {};
    const typeBreakdown: TypeMap = {};
    const regionBreakdown: RegionMap = {};
    const discounts: number[] = [];

    for (const n of notices) {
      const extra = n.extraData as Record<string, unknown> | null;
      const stage = (extra?.stage as string) || "Первые торги";
      const debtType = (extra?.debtType as string) || "Прочее";
      const faceValue = parseFloat(String(extra?.faceValue || "0"));
      const price = parseFloat(n.startPrice || "0");

      stageBreakdown[stage] = (stageBreakdown[stage] || 0) + 1;
      typeBreakdown[debtType] = (typeBreakdown[debtType] || 0) + 1;

      if (n.region) {
        regionBreakdown[n.region] = (regionBreakdown[n.region] || 0) + 1;
      }

      if (faceValue > 0 && price > 0 && faceValue > price) {
        const discount = Math.round((1 - price / faceValue) * 100);
        discounts.push(Math.min(discount, 99));
      }
    }

    // Discount histogram (0-9%, 10-19%, ..., 90-99%)
    const discountHistogram = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${i * 10 + 9}%`,
      count: discounts.filter(d => d >= i * 10 && d < (i + 1) * 10).length,
    }));

    const avgDiscount = discounts.length > 0
      ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length)
      : 0;

    const topRegions = Object.entries(regionBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([region, count]) => ({ region, count }));

    const stageData = Object.entries(stageBreakdown).map(([stage, count]) => ({
      stage,
      count,
    }));

    const typeData = Object.entries(typeBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([type, count]) => ({ type, count }));

    return {
      discountHistogram,
      avgDiscount,
      totalAnalyzed: notices.length,
      stageData,
      typeData,
      topRegions,
    };
  }),

  // Clear all data
  clearAll: publicQuery.mutation(async () => {
    const db = getDb();

    await db.delete(lots);
    await db.delete(auctionNotices);
    await db.delete(debtors);

    return { success: true, message: "Все данные удалены" };
  }),
});
