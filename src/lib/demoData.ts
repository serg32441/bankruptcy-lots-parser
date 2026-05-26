// Демо-данные для offline-режима (fallback когда backend недоступен)

export interface DemoLot {
  id: number;
  lotNumber: string | null;
  description: string | null;
  category: string | null;
  startPrice: string | null;
  currentPrice: string | null;
  step: string | null;
  deposit: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  noticeId: number | null;
}

export interface DemoDebtor {
  id: number;
  externalId: string;
  debtorType: string;
  name: string;
  inn: string | null;
  ogrn: string | null;
  region: string | null;
  address: string | null;
  category: string | null;
  caseNumber: string | null;
  caseStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const REGIONS = [
  "Москва", "Московская область", "Санкт-Петербург", "Ленинградская область",
  "Ростовская область", "Краснодарский край", "Свердловская область",
  "Нижегородская область", "Самарская область",
];

const COMPANIES = [
  'ООО "СтройИнвест"', 'ООО "ТехноПром"', 'ООО "ГлобалТрейд"', 'ООО "АльфаСтрой"',
  'ООО "МегаЛогистика"', 'ООО "ФинСервис"', 'ООО "ИнТех"', 'ООО "ЮниПром"',
  'ООО "АгроКомплекс"', 'ООО "ЭнергоСбыт"', 'АО "ПромТех"', 'АО "ИнвестХолдинг"',
  'ПАО "СтройКорп"', 'ООО "СтройМонтаж"', 'ООО "АвтоГрупп"',
];

const DESCRIPTIONS = [
  "Право требования задолженности по договору поставки №1523. Задолжник: ООО Ромашка. Сумма: 2,450,000 руб.",
  "Дебиторская задолженность по договору оказания услуг №892. Задолжник: ИП Иванов И.И. Сумма: 1,200,000 руб.",
  "Право требования по кредитному договору №45-2022. Заемщик: ООО СтройМастер. Остаток: 8,500,000 руб.",
  "Дебиторская задолженность за арендные платежи по договору №77. Арендатор: ООО ТехноСфера. Сумма: 3,750,000 руб.",
  "Право требования по договору подряда №334/2023. Сумма: 5,100,000 руб.",
  "Дебиторская задолженность за поставку оборудования. Покупатель: ООО ПромСнаб. Сумма: 1,890,000 руб.",
  "Право требования по договору займа №ZG-2023-45. Основной долг: 12,000,000 руб.",
  "Дебиторская задолженность за коммунальные услуги. Сумма: 980,000 руб.",
  "Право требования по договору франшизы №FR-88. Задолженность по роялти: 450,000 руб.",
  "Дебиторская задолженность за выполненные строительные работы. Сумма: 7,300,000 руб.",
  "Право требования по векселю серии ВТ №0012563. Номинал: 3,200,000 руб.",
  "Дебиторская задолженность за лицензионные платежи. Сумма: 890,000 руб.",
  "Право требования по договору перевода долга №PD-44. Сумма: 15,000,000 руб.",
  "Дебиторская задолженность за оказанные консультационные услуги. Сумма: 2,100,000 руб.",
  "Право требования по гарантийному письму. Сумма: 6,700,000 руб.",
  "Дебиторская задолженность за поставку сырья. Сумма: 4,400,000 руб.",
  "Право требования по договору факторинга №F-77. Сумма: 9,800,000 руб.",
  "Дебиторская задолженность по договору аренды оборудования. Сумма: 3,150,000 руб.",
  "Право требования по договору поставки №678/2023. Сумма: 5,600,000 руб.",
  "Дебиторская задолженность по договору менеджмента. Сумма: 1,750,000 руб.",
];

function r<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function ri(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function formatPrice(min: number, max: number): string {
  return (ri(min, max)).toString();
}

function genINN(): string { return Array.from({length: 10}, () => ri(0, 9)).join(''); }
function genOGRN(): string { return Array.from({length: 13}, () => ri(0, 9)).join(''); }
function genCase(): string {
  const regs = ["40", "77", "78", "61", "23", "66"];
  return `А${r(regs)}-${ri(10000, 99999)}/${ri(2019, 2024)}`;
}

export const demoDebtors: DemoDebtor[] = Array.from({length: 15}, (_, i) => ({
  id: i + 1,
  externalId: `DEB-${1000 + i}`,
  debtorType: "legal",
  name: COMPANIES[i % COMPANIES.length],
  inn: genINN(),
  ogrn: genOGRN(),
  region: r(REGIONS),
  address: `${r(REGIONS)}, ул. Промышленная, д. ${ri(1, 150)}`,
  category: "Обычная организация",
  caseNumber: genCase(),
  caseStatus: Math.random() > 0.3 ? "active" : "completed",
  createdAt: new Date(Date.now() - ri(1, 60) * 86400000),
  updatedAt: new Date(),
}));

export const demoLots: DemoLot[] = Array.from({length: 20}, (_, i) => {
  const price = formatPrice(500000, 25000000);
  const status = r(["active", "active", "active", "completed", "cancelled"]);
  return {
    id: i + 1,
    lotNumber: `${ri(1, 50)}`,
    description: DESCRIPTIONS[i % DESCRIPTIONS.length],
    category: "debt",
    startPrice: price,
    currentPrice: price,
    step: "5%",
    deposit: Math.floor(parseInt(price) * 0.2).toString(),
    status,
    createdAt: new Date(Date.now() - ri(1, 30) * 86400000),
    updatedAt: new Date(),
    noticeId: ri(1, 15),
  };
});

export const demoStats = {
  newLots: 1284,
  newLotsChange: "+18%",
  avgDiscount: "42%",
  avgDiscountChange: "−6 п.п.",
  todayAuctions: 96,
  urgentAuctions: 12,
  debtors: demoDebtors.length,
  notices: demoLots.length,
  lots: demoLots.length,
  volume: "480.8 млн ₽",
  discount: "53%",
};

export interface Recommendation {
  id: number;
  title: string;
  location: string;
  discount: string;
}

export const demoRecommendations: Recommendation[] = [
  { id: 1, title: "Квартира 54 м²", location: "Москва", discount: "-38%" },
  { id: 2, title: "Toyota Camry 2019", location: "Казань", discount: "-31%" },
  { id: 3, title: "Склад 820 м²", location: "Ростов", discount: "-46%" },
];

export const demoChartData = [
  { day: "Пн", value: 45 },
  { day: "Вт", value: 72 },
  { day: "Ср", value: 58 },
  { day: "Чт", value: 90 },
  { day: "Пт", value: 65 },
  { day: "Сб", value: 110 },
  { day: "Вс", value: 85 },
];

export interface ActualLot {
  id: number;
  title: string;
  region: string;
  startPrice: string;
  discount: string;
  endDate: string;
  status: string;
  statusColor: string;
}

export const demoActualLots: ActualLot[] = [
  { id: 1, title: "Квартира 2-к, 54 м²", region: "Санкт-Петербург", startPrice: "6 450 000 ₽", discount: "−34%", endDate: "сегодня 18:00", status: "идут торги", statusColor: "blue" },
  { id: 2, title: "Земельный участок 12 сот.", region: "Краснодарский край", startPrice: "1 280 000 ₽", discount: "−51%", endDate: "завтра 12:30", status: "приём заявок", statusColor: "green" },
  { id: 3, title: "Mercedes-Benz GLC 2020", region: "Москва", startPrice: "2 950 000 ₽", discount: "−28%", endDate: "29 мая", status: "новый", statusColor: "blue" },
  { id: 4, title: "Дебиторская задолженность", region: "Новосибирск", startPrice: "840 000 ₽", discount: "−63%", endDate: "31 мая", status: "риск высокий", statusColor: "red" },
];

// Фильтрация лотов
export function filterLots(
  options: { page?: number; limit?: number; category?: string; status?: string; search?: string }
) {
  const { page = 1, limit = 20, category, status, search } = options;
  let items = [...demoLots];

  if (category) items = items.filter(l => l.category === category);
  if (status) items = items.filter(l => l.status === status);
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(l => (l.description ?? '').toLowerCase().includes(s));
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const paginated = items.slice(start, start + limit);

  return { items: paginated, total, page, limit };
}

// Фильтрация должников
export function filterDebtors(
  options: { page?: number; limit?: number; search?: string }
) {
  const { page = 1, limit = 20, search } = options;
  let items = [...demoDebtors];

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(d =>
      (d.name ?? '').toLowerCase().includes(s) ||
      (d.inn ?? '').includes(s)
    );
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const paginated = items.slice(start, start + limit);

  return { items: paginated, total, page, limit };
}
