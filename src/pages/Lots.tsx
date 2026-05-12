import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Gavel, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { filterLots } from "@/lib/demoData";
import { useApiStatus } from "@/hooks/useApiStatus";

const CATEGORY_LABELS: Record<string, string> = {
  debt: "Дебиторская задолженность",
  realty: "Недвижимость",
  movables: "Движимое имущество",
  securities: "Ценные бумаги",
  other: "Прочее",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  completed: "Завершён",
  cancelled: "Отменён",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function Lots() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const apiConnected = useApiStatus();

  const { data: apiData } = trpc.lots.list.useQuery(
    { page, limit: 20, category: category || undefined, status: status || undefined, search: search || undefined },
    { retry: false, refetchOnWindowFocus: false, enabled: apiConnected === true }
  );

  const demoData = useMemo(() =>
    filterLots({ page, limit: 20, category: category || undefined, status: status || undefined, search: search || undefined }),
    [page, category, status, search]
  );

  const data = apiConnected === true && apiData ? apiData : demoData;
  const totalPages = Math.ceil(data.total / data.limit);
  const isLoading = apiConnected === null;

  const formatPrice = (price: string | null) => {
    if (!price) return "—";
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Gavel className="w-8 h-8 text-blue-600" />
            Лоты торгов
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Дебиторская задолженность с торгов по банкротству
            {apiConnected === false && <span className="text-amber-500 ml-2">(демо-данные)</span>}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Поиск по описанию лота..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все категории</SelectItem>
                  <SelectItem value="debt">Дебиторская задолженность</SelectItem>
                  <SelectItem value="realty">Недвижимость</SelectItem>
                  <SelectItem value="movables">Движимое имущество</SelectItem>
                  <SelectItem value="securities">Ценные бумаги</SelectItem>
                  <SelectItem value="other">Прочее</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все статусы</SelectItem>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="completed">Завершён</SelectItem>
                  <SelectItem value="cancelled">Отменён</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        Найдено: {data.total} лотов
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-pulse text-gray-400">Загрузка...</div>
            </div>
          ) : !data.items.length ? (
            <div className="text-center py-20 text-gray-500">
              <Gavel className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Лоты не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№ Лота</TableHead>
                    <TableHead>Описание</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Начальная цена</TableHead>
                    <TableHead>Задаток</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((lot) => (
                    <TableRow key={lot.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-mono text-sm">
                        #{lot.lotNumber ?? lot.id}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm max-w-md truncate" title={lot.description ?? ""}>
                          {lot.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CATEGORY_LABELS[lot.category ?? "other"] ?? lot.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(lot.startPrice)}
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {formatPrice(lot.deposit)}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[lot.status ?? "active"] ?? ""}>
                          {STATUS_LABELS[lot.status ?? "active"] ?? lot.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {lot.createdAt
                          ? new Date(lot.createdAt).toLocaleDateString("ru-RU")
                          : "—"}
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
          <p className="text-sm text-gray-500">
            Страница {page} из {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
