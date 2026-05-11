import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

// --- Должники (банкроты) ---
export const debtors = pgTable("debtors", {
  id: serial("id").primaryKey(),
  // Идентификатор из ЕФРСБ (guid)
  externalId: varchar("external_id", { length: 64 }).notNull().unique(),
  // Тип должника: fiz (физ.лицо) | legal (юр.лицо)
  debtorType: varchar("debtor_type", { length: 10 }).notNull(),
  // Наименование / ФИО
  name: varchar("name", { length: 500 }).notNull(),
  // ИНН
  inn: varchar("inn", { length: 20 }),
  // ОГРН / ОГРНИП
  ogrn: varchar("ogrn", { length: 20 }),
  // СНИЛС (для физ. лиц)
  snils: varchar("snils", { length: 20 }),
  // Регион
  region: varchar("region", { length: 200 }),
  // Адрес
  address: text("address"),
  // Категория должника
  category: varchar("category", { length: 200 }),
  // Номер дела о банкротстве
  caseNumber: varchar("case_number", { length: 100 }),
  // Статус дела (active | completed)
  caseStatus: varchar("case_status", { length: 20 }),
  // Дата создания записи
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Дата обновления
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Объявления о торгах (Auction2 из ЕФРСБ) ---
export const auctionNotices = pgTable("auction_notices", {
  id: serial("id").primaryKey(),
  // ID сообщения в ЕФРСБ
  messageId: varchar("message_id", { length: 64 }).notNull().unique(),
  // Ссылка на должника
  debtorId: integer("debtor_id").references(() => debtors.id),
  // Тип сообщения: Auction2 | ChangeAuction2 | SaleOrderPledgedProperty2
  messageType: varchar("message_type", { length: 50 }).notNull(),
  // Номер сообщения в ЕФРСБ
  messageNumber: varchar("message_number", { length: 50 }),
  // Дата публикации
  publishDate: timestamp("publish_date"),
  // Арбитражный управляющий (ФИО)
  managerName: varchar("manager_name", { length: 300 }),
  // Организатор торгов
  organizerName: varchar("organizer_name", { length: 300 }),
  // ЭТП (электронная торговая площадка)
  etp: varchar("etp", { length: 200 }),
  // Дата начала подачи заявок
  bidStartDate: timestamp("bid_start_date"),
  // Дата окончания подачи заявок
  bidEndDate: timestamp("bid_end_date"),
  // Дата проведения торгов
  auctionDate: timestamp("auction_date"),
  // Форма проведения (открытый аукцион / публичное предложение)
  auctionForm: varchar("auction_form", { length: 100 }),
  // Номер лота
  lotNumber: varchar("lot_number", { length: 50 }),
  // Описание лота
  lotDescription: text("lot_description"),
  // Категория имущества: debt (дебиторка) | realty | movables | securities | other
  propertyCategory: varchar("property_category", { length: 50 }),
  // Начальная цена
  startPrice: decimal("start_price", { precision: 18, scale: 2 }),
  // Шаг аукциона
  auctionStep: decimal("auction_step", { precision: 18, scale: 2 }),
  // Задаток
  deposit: decimal("deposit", { precision: 18, scale: 2 }),
  // Валюта
  currency: varchar("currency", { length: 10 }).default("RUB"),
  // Ссылка на сообщение в ЕФРСБ
  fedresursUrl: text("fedresurs_url"),
  // Признак актуальности
  isActive: boolean("is_active").default(true),
  // Дополнительные данные (JSON)
  extraData: jsonb("extra_data"),
  // Дата создания записи
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Дата обновления
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// --- Лоты (если в одном объявлении несколько лотов) ---
export const lots = pgTable("lots", {
  id: serial("id").primaryKey(),
  // Ссылка на объявление
  noticeId: integer("notice_id").references(() => auctionNotices.id),
  // Номер лота
  lotNumber: varchar("lot_number", { length: 50 }),
  // Описание
  description: text("description").notNull(),
  // Категория: debt | realty | movables | securities | other
  category: varchar("category", { length: 50 }),
  // Начальная цена
  startPrice: decimal("start_price", { precision: 18, scale: 2 }),
  // Текущая цена (после снижения)
  currentPrice: decimal("current_price", { precision: 18, scale: 2 }),
  // Шаг аукциона (% или сумма)
  step: varchar("step", { length: 50 }),
  // Задаток
  deposit: decimal("deposit", { precision: 18, scale: 2 }),
  // Статус: active | completed | cancelled
  status: varchar("status", { length: 20 }).default("active"),
  // Дата создания
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Дата обновления
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
