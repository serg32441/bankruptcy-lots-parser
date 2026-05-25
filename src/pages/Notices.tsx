import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  User,
  Globe,
  Building2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU");
}

function formatPrice(p: string | null | undefined) {
  if (!p) return "—";
  const num = parseFloat(p);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(num);
}

type Notice = {
  id: number;
  messageId: string;
  debtorId: number | null;
  messageType: string;
  messageNumber: string | null;
  publishDate: Date | null;
  managerName: string | null;
  organizerName: string | null;
  etp: string | null;
  bidStartDate: Date | null;
  bidEndDate: Date | null;
  auctionDate: Date | null;
  auctionForm: string | null;
  lotNumber: string | null;
  lotDescription: string | null;
  propertyCategory: string | null;
  startPrice: string | null;
  auctionStep: string | null;
  deposit: string | null;
  currency: string | null;
  fedresursUrl: string | null;
  isActive: boolean | null;
  extraData: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function NoticeDetail({ notice, open, onClose }: { notice: Notice | null; open: boolean; onClose: () => void }) {
  if (!notice) return null;
  const extra = notice.extraData as Record<string, unknown> | null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Объявление #{notice.messageNumber ?? notice.id}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="flex gap-2 flex-wrap">
            {notice.isActive ? (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                Активно
              </Badge>
            ) : (
              <Badge variant="secondary">Завершено</Badge>
            )}
            {notice.auctionForm && (
              <Badge variant="outline">{notice.auctionForm}</Badge>
            )}
            {extra?.stage && (
              <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-400">
                {String(extra.stage)}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Начальная цена</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {formatPrice(notice.startPrice)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Задаток</p>
              <p className="text-lg font-bold">{formatPrice(notice.deposit)}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {notice.bidEndDate && (
              <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Приём заявок</p>
                  <p className="font-medium">
                    {formatDate(notice.bidStartDate)} — {formatDate(notice.bidEndDate)}
                  </p>
                </div>
              </div>
            )}
            {notice.auctionDate && (
              <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Дата торгов</p>
                  <p className="font-medium">{formatDate(notice.auctionDate)}</p>
                </div>
              </div>
            )}
            {notice.managerName && (
              <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Арбитражный управляющий</p>
                  <p className="font-medium">{notice.managerName}</p>
                </div>
              </div>
            )}
            {notice.organizerName && (
              <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Организатор торгов</p>
                  <p className="font-medium">{notice.organizerName}</p>
                </div>
              </div>
            )}
            {notice.etp && (
              <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Электронная площадка</p>
                  <p className="font-medium">{notice.etp}</p>
                </div>
              </div>
            )}
          </div>

          {notice.lotDescription && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Описание лота
              </p>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {notice.lotDescription}
                </p>
              </div>
            </div>
          )}

          {notice.fedresursUrl && (
            <a
              href={notice.fedresursUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Открыть на ЕФРСБ
            </a>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Notices() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading } = trpc.auctionNotices.list.useQuery({
    page,
    limit: 20,
    propertyCategory: "debt",
    search: search || undefined,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-blue-600" />
          Объявления о торгах
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Все объявления об аукционах по банкротству
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по описанию лота..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        {isLoading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          `Найдено: ${data?.total ?? 0} объявлений`
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
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Объявления не найдены</p>
              <p className="text-sm mt-1">Загрузите данные в разделе «Парсер»</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                    <TableHead>Публикация</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Площадка</TableHead>
                    <TableHead className="text-right">Цена</TableHead>
                    <TableHead>Срок заявок</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((notice) => (
                    <TableRow
                      key={notice.id}
                      className="cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                      onClick={() => { setSelectedNotice(notice); setDetailOpen(true); }}
                    >
                      <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(notice.publishDate)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-xs truncate" title={notice.lotDescription ?? ""}>
                          {notice.lotDescription || "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {notice.etp || "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums whitespace-nowrap">
                        {formatPrice(notice.startPrice)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                        до {formatDate(notice.bidEndDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            notice.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          }
                        >
                          {notice.isActive ? "Активно" : "Завершено"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Стр. {page} из {totalPages}</p>
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

      <NoticeDetail notice={selectedNotice} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  );
}
