// ЕФРСБ (fedresurs.ru) demo API client
// Demo endpoint: bank-publications-demo.fedresurs.ru
// Docs: https://bank-publications-demo.fedresurs.ru/swagger

const BASE_URL = "https://bank-publications-demo.fedresurs.ru";
const DEMO_CREDENTIALS = "demowebuser:Axl761BN";

function authHeader() {
  return "Basic " + Buffer.from(DEMO_CREDENTIALS).toString("base64");
}

export interface FedresursMessage {
  guid: string;
  messageType: string;
  publishDate: string;
  debtorName?: string;
  debtorInn?: string;
  debtorOgrn?: string;
  debtorRegion?: string;
  caseNumber?: string;
  lots?: FedresursLot[];
  managerName?: string;
  organizerName?: string;
  etp?: string;
  bidStartDate?: string;
  bidEndDate?: string;
  auctionDate?: string;
  auctionForm?: string;
  // raw message body for extra data
  body?: Record<string, unknown>;
}

export interface FedresursLot {
  number?: string;
  description?: string;
  startPrice?: number;
  step?: number;
  deposit?: number;
  propertyCategory?: string;
}

export interface FedresursSearchResult {
  messages: FedresursMessage[];
  total: number;
  page: number;
  pageSize: number;
}

// Search messages — POST /api/v2/messages/search or GET /api/v2/messages
export async function searchMessages(params: {
  messageType?: string;
  page?: number;
  pageSize?: number;
  publishDateFrom?: string;
  publishDateTo?: string;
}): Promise<FedresursSearchResult> {
  const {
    messageType = "Auction2",
    page = 0,
    pageSize = 20,
    publishDateFrom,
    publishDateTo,
  } = params;

  const url = new URL(`${BASE_URL}/api/v2/messages`);
  url.searchParams.set("messageType", messageType);
  url.searchParams.set("pageNum", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  if (publishDateFrom) url.searchParams.set("publishDateFrom", publishDateFrom);
  if (publishDateTo) url.searchParams.set("publishDateTo", publishDateTo);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`ЕФРСБ API: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return normalizeSearchResult(json, page, pageSize);
}

function normalizeSearchResult(
  raw: unknown,
  page: number,
  pageSize: number
): FedresursSearchResult {
  if (!raw || typeof raw !== "object") {
    return { messages: [], total: 0, page, pageSize };
  }

  const r = raw as Record<string, unknown>;

  // Different API versions return different shapes
  const data =
    (r["data"] as unknown[]) ||
    (r["messages"] as unknown[]) ||
    (r["items"] as unknown[]) ||
    [];

  const total =
    typeof r["total"] === "number"
      ? r["total"]
      : typeof r["totalCount"] === "number"
        ? r["totalCount"]
        : data.length;

  const messages = data.map(normalizeMessage);
  return { messages, total, page, pageSize };
}

function normalizeMessage(raw: unknown): FedresursMessage {
  if (!raw || typeof raw !== "object") return { guid: "", messageType: "" };
  const r = raw as Record<string, unknown>;

  const debtor = (r["debtor"] as Record<string, unknown>) || {};

  const lotsRaw = (r["lots"] as unknown[]) || (r["items"] as unknown[]) || [];

  return {
    guid: String(r["id"] || r["guid"] || r["messageId"] || ""),
    messageType: String(r["type"] || r["messageType"] || "Auction2"),
    publishDate: String(r["publishDate"] || r["datePublished"] || ""),
    debtorName: String(debtor["name"] || r["debtorName"] || ""),
    debtorInn: String(debtor["inn"] || r["debtorInn"] || ""),
    debtorOgrn: String(debtor["ogrn"] || r["debtorOgrn"] || ""),
    debtorRegion: String(debtor["region"] || r["debtorRegion"] || ""),
    caseNumber: String(r["caseNumber"] || r["bankruptcyCaseNumber"] || ""),
    managerName: String(r["managerName"] || r["managerFio"] || ""),
    organizerName: String(r["organizerName"] || ""),
    etp: String(r["etpName"] || r["etp"] || ""),
    bidStartDate: String(r["bidStartDate"] || r["acceptStartDate"] || ""),
    bidEndDate: String(r["bidEndDate"] || r["acceptEndDate"] || ""),
    auctionDate: String(r["auctionDate"] || r["tradeDate"] || ""),
    auctionForm: String(r["auctionForm"] || r["tradeType"] || ""),
    lots: lotsRaw.map(normalizeLot),
    body: r,
  };
}

function normalizeLot(raw: unknown): FedresursLot {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;

  return {
    number: String(r["number"] || r["lotNumber"] || r["num"] || ""),
    description: String(
      r["description"] || r["name"] || r["lotDescription"] || ""
    ),
    startPrice: parseFloat(String(r["startPrice"] || r["initialPrice"] || "0")),
    step: parseFloat(String(r["step"] || r["auctionStep"] || "0")),
    deposit: parseFloat(String(r["deposit"] || r["guarantee"] || "0")),
    propertyCategory: String(
      r["propertyCategory"] || r["lotType"] || "other"
    ),
  };
}
