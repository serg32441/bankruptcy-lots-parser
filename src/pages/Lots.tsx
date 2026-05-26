import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Gavel,
  TrendingDown,
  ExternalLink,
  Calendar,
  CircleDollarSign,
  Eye,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Star,
  Activity,
  BarChart2,
  Layers,
  Database,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  completed: "Завершён",
  cancelled: "Отменён",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function formatPrice(price: string | null | undefined) {
  if (!price) return "—";
  const n = parseFloat(price);
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(n) + " ₽";
}

function formatPriceShort(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} млрд ₽`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} млн ₽`;
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₽";
}

function extractFaceValue(description: string | null): number | null {
  if (!description) return null;
  const patterns = [
    /(?:сумма|номинал|остаток|долг)[^:]*:\s*([\d\s]+(?:,\d+)?)\s*(?:руб|₽)/gi,
    /(\d[\d\s]{4,})\s*(?:руб|₽)/gi,
  ];
  for (const pat of patterns) {
    const m = pat.exec(description);
    if (m) {
      const val = parseInt(m[1].replace(/\s/g, ""));
      if (!isNaN(val) && val > 100_000) return val;
    }
  }
  return null;
}

function getDiscount(startPrice: string | null, faceValue: number | null): number | null {
  if (!startPrice || !faceValue) return null;
  const price = parseFloat(startPrice);
  if (price <= 0 || faceValue <= price) return null;
  return Math.round((1 - price / faceValue) * 100);
}

// Extract structured info from description
function parseDescription(description: string | null) {
  if (!description) return { title: "—", company: "", contractType: "", caseNumber: "" };

  const lines = description.split("\n").map(l => l.trim()).filter(Boolean);
  const title = lines[0] || description.slice(0, 80);

  // Extract company
  const companyMatch = description.match(/(?:должник|задолжник|заемщик|арендатор|заказчик|покупатель|клиент|франчайзи|векселедатель|лицензиат)[:\s]+([А-ЯЁа-яёA-Za-z0-9\s«»"'.,\-]+?)(?:\.|,|;|\n|$)/i);
  const company = companyMatch ? companyMatch[1].trim().slice(0, 40) : "";

  // Detect contract type
  const lower = description.toLowerCase();
  let contractType = "";
  if (lower.includes("займ") || lower.includes("кредит")) contractType = "Займ/Кредит";
  else if (lower.includes("аренд")) contractType = "Договор аренды";
  else if (lower.includes("подряд")) contractType = "Договор подряда";
  else if (lower.includes("поставк")) contractType = "Договор поставки";
  else if (lower.includes("вексел")) contractType = "Вексель";
  else if (lower.includes("факторинг")) contractType = "Факторинг";
  else if (lower.includes("цесси")) contractType = "Договор цессии";
  else if (lower.includes("услуг")) contractType = "Договор оказания услуг";
  else contractType = "Прочее";

  // Extract case number
  const caseMatch = description.match(/№\s*([А-ЯЁа-яё0-9\-\/]+)/);
  const caseNumber = caseMatch ? "№ " + caseMatch[1] : "";

  return { title, company, contractType, caseNumber };
}

type Lot = {
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
};

function LotDetail({ lot, open, onClose }: { lot: Lot | null; open: boolean; onClose: () => void }) {
  if (!lot) return null;
  const faceValue = extractFaceValue(lot.description);
  const discount = getDiscount(lot.startPrice, faceValue);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-blue-600" />
            Лот #{lot.lotNumber ?? lot.id}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-3">
            <Badge className={STATUS_COLORS[lot.status ?? "active"]}>
              {STATUS_LABELS[lot.status ?? "active"]}
            </Badge>
            <Badge variant="outline">Дебиторская задолженность</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Начальная цена</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{formatPrice(lot.startPrice)}</p>
            </div>
            {faceValue && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Номинал долга</p>
                <p className="text-xl font-bold">{formatPrice(faceValue.toString())}</p>
              </div>
            )}
          </div>
          {discount !== null && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <TrendingDown className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300 text-lg">Скидка {discount}% от номинала</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Потенциальный ROI: {Math.round(faceValue! / parseFloat(lot.startPrice!) * 100 - 100)}%
                </p>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
              <CircleDollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div><p className="text-xs text-gray-500">Задаток</p><p className="text-sm font-medium">{formatPrice(lot.deposit)}</p></div>
            </div>
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
              <Gavel className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div><p className="text-xs text-gray-500">Шаг аукциона</p><p className="text-sm font-medium">{lot.step || "—"}</p></div>
            </div>
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div><p className="text-xs text-gray-500">Дата публикации</p><p className="text-sm font-medium">{new Date(lot.createdAt).toLocaleDateString("ru-RU")}</p></div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Описание лота</p>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{lot.description || "—"}</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

const PAGE_SIZE = 10;

export default function Lots() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const { data, isLoading } = trpc.lots.list.useQuery({
    page: 1,
    limit: 200,
    category: "debt",
  });

  const allLots = data?.items ?? [];

  // Compute stats
  const stats = useMemo(() => {
    const active = allLots.filter(l => l.status === "active");
    const totalValue = allLots.reduce((s, l) => s + parseFloat(l.startPrice || "0"), 0);

    const discounts: number[] = [];
    for (const l of active) {
      const fv = extractFaceValue(l.description);
      const d = getDiscount(l.startPrice, fv);
      if (d !== null) discounts.push(d);
    }
    const avgDiscount = discounts.length > 0
      ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length)
      : 0;

    return {
      total: allLots.length,
      active: active.length,
      activePercent: allLots.length > 0 ? Math.round(active.length / allLots.length * 100) : 0,
      avgDiscount,
      totalValue,
    };
  }, [allLots]);

  // Filter by tab
  const filtered = useMemo(() => {
    let items = allLots;
    if (activeTab === "active") items = items.filter(l => l.status === "active");
    else if (activeTab === "completed") items = items.filter(l => l.status === "completed");
    else if (activeTab === "cancelled") items = items.filter(l => l.status === "cancelled");
    else if (activeTab === "favorites") items = items.filter(l => favorites.has(l.id));

    if (search) {
      const s = search.toLowerCase();
      items = items.filter(l => (l.description ?? "").toLowerCase().includes(s));
    }
    return items;
  }, [allLots, activeTab, search, favorites]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = useMemo(() => ({
    all: allLots.length,
    active: allLots.filter(l => l.status === "active").length,
    completed: allLots.filter(l => l.status === "completed").length,
    cancelled: allLots.filter(l => l.status === "cancelled").length,
    favorites: favorites.size,
  }), [allLots, favorites]);

  const tabs = [
    { key: "all", label: "Все", count: counts.all, dot: null },
    { key: "active", label: "Активные", count: counts.active, dot: "bg-emerald-500" },
    { key: "completed", label: "Завершённые", count: counts.completed, dot: "bg-blue-500" },
    { key: "cancelled", label: "Отменённые", count: counts.cancelled, dot: "bg-red-500" },
    { key: "favorites", label: "Избранные", count: counts.favorites, dot: null, star: true },
  ];

  function toggleFavorite(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Лоты</h1>
          <p className="text-sm text-gray-500 mt-0.5">Поиск и анализ дебиторской задолженности на торгах по банкротству</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />Экспорт
          </Button>
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Star className="w-4 h-4" />Сохранить поиск
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  <p className="text-xs text-gray-500">Найдено лотов</p>
                  <p className="text-xs text-gray-400">Всего по запросу</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                  <p className="text-xs text-gray-500">Активные</p>
                  <p className="text-xs text-gray-400">{stats.activePercent}% от общего числа</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <BarChart2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.avgDiscount}%</p>
                  <p className="text-xs text-gray-500">Средний дисконт</p>
                  <p className="text-xs text-gray-400">По активным лотам</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{formatPriceShort(stats.totalValue)}</p>
                  <p className="text-xs text-gray-500">Общий объём</p>
                  <p className="text-xs text-gray-400">По всем лотам</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию лота, договору, должнику, № дела..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <Button variant="outline" className="gap-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              Фильтры
            </Button>
            <Button variant="outline" className="gap-2 shrink-0">
              <ArrowUpDown className="w-4 h-4" />
              Сортировка: по дате
            </Button>
            {search && (
              <Button variant="ghost" onClick={() => setSearch("")} className="shrink-0 text-gray-500">
                Сбросить
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.dot && <span className={`w-2 h-2 rounded-full ${tab.dot}`} />}
            {tab.star && <Star className="w-3.5 h-3.5" />}
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
              activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : !paginated.length ? (
          <div className="text-center py-20 text-gray-500">
            <Gavel className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-medium">Лоты не найдены</p>
            <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-12">№</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Лот</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 whitespace-nowrap">
                      Цена торгов
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Дисконт</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Задаток</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Статус</th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginated.map((lot) => {
                    const faceValue = extractFaceValue(lot.description);
                    const discount = getDiscount(lot.startPrice, faceValue);
                    const { title, company, contractType, caseNumber } = parseDescription(lot.description);
                    const isFav = favorites.has(lot.id);

                    return (
                      <tr
                        key={lot.id}
                        className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                        onClick={() => { setSelectedLot(lot); setDetailOpen(true); }}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-400 font-mono">#{lot.lotNumber ?? lot.id}</span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={title}>{title}</p>
                          {(company || contractType) && (
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {company && <span className="text-xs text-gray-500 truncate max-w-[140px]">{company}</span>}
                              {company && contractType && <span className="text-gray-300 text-xs">•</span>}
                              {contractType && <span className="text-xs text-gray-400">{contractType}</span>}
                              {caseNumber && <><span className="text-gray-300 text-xs">•</span><span className="text-xs text-blue-500 dark:text-blue-400">{caseNumber}</span></>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums whitespace-nowrap">
                            {formatPrice(lot.startPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {discount !== null ? (
                            <span className="inline-flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                              <TrendingDown className="w-3.5 h-3.5" />
                              {discount}%
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-600 dark:text-gray-400 tabular-nums whitespace-nowrap">
                            {formatPrice(lot.deposit)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`${STATUS_COLORS[lot.status ?? "active"]} text-xs font-medium`}>
                            {STATUS_LABELS[lot.status ?? "active"]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 transition-colors"
                              onClick={(e) => { e.stopPropagation(); setSelectedLot(lot); setDetailOpen(true); }}
                              title="Просмотр"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isFav ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
                              onClick={(e) => toggleFavorite(lot.id, e)}
                              title="В избранное"
                            >
                              <Bookmark className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => { setSelectedLot(lot); setDetailOpen(true); }}>
                                  <Eye className="w-4 h-4 mr-2" />Просмотр
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => toggleFavorite(lot.id, e as unknown as React.MouseEvent)}>
                                  <Bookmark className="w-4 h-4 mr-2" />{isFav ? "Убрать из избранного" : "В избранное"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Показано {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} из {filtered.length} лотов
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setPage(1)} disabled={page <= 1}>
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                  return (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "ghost"}
                      size="icon"
                      className={`w-8 h-8 text-sm ${page === p ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  );
                })}
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <LotDetail lot={selectedLot} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  );
}
