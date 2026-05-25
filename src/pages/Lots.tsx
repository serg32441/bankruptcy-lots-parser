import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Gavel,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  ExternalLink,
  Calendar,
  CircleDollarSign,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  completed: "Завершён",
  cancelled: "Отменён",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function formatPrice(price: string | null | undefined) {
  if (!price) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(parseFloat(price));
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
          {/* Status */}
          <div className="flex items-center gap-3">
            <Badge className={STATUS_COLORS[lot.status ?? "active"]}>
              {STATUS_LABELS[lot.status ?? "active"]}
            </Badge>
            <Badge variant="outline">Дебиторская задолженность</Badge>
          </div>

          {/* Price block */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Начальная цена</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                {formatPrice(lot.startPrice)}
              </p>
            </div>

            {faceValue && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Номинал долга</p>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
                  {formatPrice(faceValue.toString())}
                </p>
              </div>
            )}
          </div>

          {/* Discount badge */}
          {discount !== null && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <TrendingDown className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-300 text-lg">
                  Скидка {discount}% от номинала
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                  Потенциальный ROI: {Math.round(faceValue! / parseFloat(lot.startPrice!) * 100 - 100)}%
                </p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
              <CircleDollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Задаток</p>
                <p className="text-sm font-medium">{formatPrice(lot.deposit)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
              <Gavel className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Шаг аукциона</p>
                <p className="text-sm font-medium">{lot.step || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Дата публикации</p>
                <p className="text-sm font-medium">
                  {new Date(lot.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Описание лота
            </p>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {lot.description || "Описание отсутствует"}
              </p>
            </div>
          </div>

          {/* Analysis hint */}
          {discount !== null && (
            <div className="text-xs text-gray-500 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
              <strong className="text-amber-700 dark:text-amber-400">Анализ:</strong>{" "}
              Дебиторская задолженность продаётся с дисконтом {discount}%. Перед покупкой
              рекомендуется проверить платёжеспособность дебитора и наличие судебных решений.
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Lots() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading } = trpc.lots.list.useQuery({
    page,
    limit: 20,
    category: "debt",
    status: status || undefined,
    search: search || undefined,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Gavel className="w-8 h-8 text-blue-600" />
          Лоты торгов
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Дебиторская задолженность с торгов по банкротству
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск по описанию..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="completed">Завершённые</SelectItem>
                  <SelectItem value="cancelled">Отменённые</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        {isLoading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          `Найдено: ${data?.total ?? 0} лотов`
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.items.length ? (
            <div className="text-center py-20 text-gray-500">
              <Gavel className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Лоты не найдены</p>
              <p className="text-sm mt-1">Загрузите данные в разделе «Парсер»</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                    <TableHead className="w-16">№</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead className="text-right">Цена торгов</TableHead>
                    <TableHead className="text-right">Скидка</TableHead>
                    <TableHead className="text-right">Задаток</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((lot) => {
                    const faceValue = extractFaceValue(lot.description);
                    const discount = getDiscount(lot.startPrice, faceValue);
                    return (
                      <TableRow
                        key={lot.id}
                        className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer transition-colors"
                        onClick={() => { setSelectedLot(lot); setDetailOpen(true); }}
                      >
                        <TableCell className="font-mono text-sm text-gray-500">
                          #{lot.lotNumber ?? lot.id}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm max-w-xs truncate" title={lot.description ?? ""}>
                            {lot.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">
                          {formatPrice(lot.startPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {discount !== null ? (
                            <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-semibold">
                              <TrendingDown className="w-3 h-3" />
                              {discount}%
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-gray-500 tabular-nums">
                          {formatPrice(lot.deposit)}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[lot.status ?? "active"]}>
                            {STATUS_LABELS[lot.status ?? "active"]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ExternalLink className="w-4 h-4 text-gray-300 hover:text-blue-500" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Стр. {page} из {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <LotDetail lot={selectedLot} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  );
}
