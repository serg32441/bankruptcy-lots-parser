import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { debtors, auctionNotices, lots } from "@db/schema";
import { sql } from "drizzle-orm";

// Генератор случайных данных для демо
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
  "Право требования задолженности по договору поставки №1523 от 15.03.2023 года. Задолжник: ООО Ромашка. Сумма задолженности: 2,450,000 руб. Основание: неоплата поставленной продукции.",
  "Дебиторская задолженность по договору оказания услуг №892 от 10.01.2023. Задолжник: ИП Иванов И.И. Сумма долга: 1,200,000 руб. Просрочка: 180 дней.",
  "Право требования по кредитному договору №45-2022. Заемщик: ООО СтройМастер. Остаток задолженности: 8,500,000 руб. Обеспечение: поручительство.",
  "Дебиторская задолженность за арендные платежи по договору аренды №77 от 01.06.2022. Арендатор: ООо ТехноСфера. Сумма задолженности: 3,750,000 руб.",
  "Право требования по договору подряда №334/2023. Заказчик: АО ИнвестПроект. Неоплаченные работы: проектирование. Сумма: 5,100,000 руб.",
  "Дебиторская задолженность за поставку оборудования по спецификации №12. Покупатель: ООО ПромСнаб. Сумма долга: 1,890,000 руб. Пеня начислена.",
  "Право требования по договору займа №ZG-2023-45. Заемщик: ООО ФинЛайн. Основной долг: 12,000,000 руб. Проценты: 1,200,000 руб.",
  "Дебиторская задолженность за коммунальные услуги за период 2022-2023 гг. Должник: ООО БизнесЦентр. Сумма: 980,000 руб.",
  "Право требования по договору франшизы №FR-88. Франчайзи: ИП Петрова А.С. Задолженность по роялти: 450,000 руб.",
  "Дебиторская задолженность за выполненные строительные работы по акту №15 от 20.09.2023. Заказчик: ООО Девелопмент. Сумма: 7,300,000 руб.",
  "Право требования по векселю серии ВТ №0012563. Векселедатель: ООо ТоргСервис. Номинал: 3,200,000 руб.",
  "Дебиторская задолженность за лицензионные платежи по договору лицензии №L-2023-15. Лицензиат: ООо СофтИнж. Сумма: 890,000 руб.",
  "Право требования по договору перевода долга №PD-44. Новый должник: ООО МегаСтрой. Сумма долга: 15,000,000 руб.",
  "Дебиторская задолженность за оказанные консультационные услуги. Клиент: АО КорпФинанс. Сумма: 2,100,000 руб. Акт подписан.",
  "Право требования по гарантийному письму о погашении задолженности. Должник: ООо РитейлГрупп. Сумма: 6,700,000 руб.",
  "Дебиторская задолженность за поставку сырья по контракту №S-223. Покупатель: ООО ПищПром. Сумма: 4,400,000 руб.",
  "Право требования по договору факторинга №F-77. Дебитор: ООО ЛогистикПро. Сумма уступленных требований: 9,800,000 руб.",
  "Дебиторская задолженность по договору аренды оборудования. Арендатор: ООО СтройТех. Просрочка арендных платежей: 3,150,000 руб.",
  "Право требования по договору поставки №678/2023. Покупатель: ООо АвтоДилер. Задолженность за автозапчасти: 5,600,000 руб.",
  "Дебиторская задолженность по договору менеджмента. Клиент: ООо ТоргЦентр. Сумма: 1,750,000 руб.",
];

const MANAGERS = [
  "Иванов С.П.", "Петрова А.В.", "Сидоров М.К.", "Кузнецова Е.Д.",
  "Смирнов И.А.", "Попова Н.С.", "Васильев Д.Г.", "Соколова О.В.",
  "Михайлов Р.Т.", "Новикова Л.П.", "Федоров А.С.", "Морозова К.М.",
];

const ORGANIZERS = [
  "ООО Сбербанк-АСТ", "ООО Радмир Экспо", "АО Единая Электронная Торговая Площадка",
  "ООо Аукционный Дом", "НЭО Сфера", "ООО Центр Реализации",
  "АО Тендерная Площадка", "ООО ЭТП ГПБ",
];

const ETPS = [
  "Sberbank-AST", "Fabrikant", "RTS-Tender", "OTC.ru",
  "B2B-Center", "ETP GPB", "Roseltorg",
];

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

export const parserRouter = createRouter({
  // Запустить генерацию демо-данных
  generateDemoData: publicQuery
    .input(
      z.object({
        count: z.number().min(1).max(100).default(30),
      }).optional()
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const count = input?.count ?? 30;

      // Проверяем, есть ли уже данные
      const existingCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(debtors);

      if ((existingCount[0]?.count ?? 0) > 0) {
        return {
          success: false,
          message: "База данных уже содержит данные. Очистите таблицы перед повторной генерацией.",
          existingCount: existingCount[0]?.count ?? 0,
        };
      }

      const debtorIds: number[] = [];
      const now = new Date();

      // 1. Генерируем должников
      for (let i = 0; i < count; i++) {
        const region = randomItem(REGIONS);
        const companyName = randomItem(COMPANY_NAMES);
        const inn = generateINN();
        const ogrn = generateOGRN();

        const result = await db.insert(debtors).values({
          externalId: `DEB-${Date.now()}-${i}`,
          debtorType: "legal",
          name: companyName,
          inn,
          ogrn,
          region,
          address: `${region}, г. ${region.split(" ")[0]}, ул. Промышленная, д. ${randomInt(1, 150)}`,
          category: "Обычная организация",
          caseNumber: generateCaseNumber(),
          caseStatus: Math.random() > 0.3 ? "active" : "completed",
        }).returning({ id: debtors.id });

        debtorIds.push(result[0].id);
      }

      // 2. Генерируем объявления о торгах
      const noticeIds: number[] = [];
      for (let i = 0; i < count; i++) {
        const description = randomItem(DESCRIPTIONS);
        const startPrice = randomPrice(500000, 25000000);
        const deposit = Math.floor(parseInt(startPrice) * 0.2).toString();
        const step = Math.floor(parseInt(startPrice) * 0.05).toString();
        const publishDate = new Date(now.getTime() - randomInt(1, 60) * 24 * 60 * 60 * 1000);
        const bidEndDate = new Date(publishDate.getTime() + randomInt(14, 45) * 24 * 60 * 60 * 1000);

        const result = await db.insert(auctionNotices).values({
          messageId: `MSG-${Date.now()}-${i}`,
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
          auctionForm: randomItem(["Открытый аукцион", "Публичное предложение"]),
          lotNumber: `${randomInt(1, 50)}`,
          lotDescription: description,
          propertyCategory: "debt",
          startPrice,
          auctionStep: step,
          deposit,
          currency: "RUB",
          fedresursUrl: `https://fedresurs.ru/message/auction/${randomInt(100000000, 999999999)}`,
          isActive: Math.random() > 0.2,
          extraData: {
            stage: randomItem(["Первые торги", "Повторные торги", "Публичное предложение"]),
            contactPhone: `+7 (${randomInt(900, 999)}) ${randomInt(100, 999)}-${randomInt(10, 99)}-${randomInt(10, 99)}`,
            contactEmail: `info${randomInt(1, 100)}@example.com`,
          },
        }).returning({ id: auctionNotices.id });

        noticeIds.push(result[0].id);
      }

      // 3. Генерируем лоты
      for (let i = 0; i < count; i++) {
        const description = randomItem(DESCRIPTIONS);
        const startPrice = randomPrice(500000, 25000000);
        const deposit = Math.floor(parseInt(startPrice) * 0.2).toString();

        await db.insert(lots).values({
          noticeId: noticeIds[i % noticeIds.length],
          lotNumber: `${randomInt(1, 10)}`,
          description,
          category: "debt",
          startPrice,
          currentPrice: startPrice,
          step: "5%",
          deposit,
          status: randomItem(["active", "active", "active", "completed", "cancelled"]),
        });
      }

      return {
        success: true,
        message: `Сгенерировано ${count} должников, ${count} объявлений и ${count} лотов`,
        generated: {
          debtors: count,
          notices: count,
          lots: count,
        },
      };
    }),

  // Получить статистику
  stats: publicQuery.query(async () => {
    const db = getDb();

    const [debtorsCount, noticesCount, lotsCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(debtors),
      db.select({ count: sql<number>`count(*)` }).from(auctionNotices),
      db.select({ count: sql<number>`count(*)` }).from(lots),
    ]);

    return {
      debtors: debtorsCount[0]?.count ?? 0,
      notices: noticesCount[0]?.count ?? 0,
      lots: lotsCount[0]?.count ?? 0,
    };
  }),

  // Очистить все данные
  clearAll: publicQuery.mutation(async () => {
    const db = getDb();

    await db.delete(lots);
    await db.delete(auctionNotices);
    await db.delete(debtors);

    return { success: true, message: "Все данные удалены" };
  }),
});
