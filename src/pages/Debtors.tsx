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
import { Search, Users, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

const STATUS_LABELS: Record<string, string> = {
  active: "В производстве",
  completed: "Завершено",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  completed: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export default function Debtors() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = trpc.debtors.list.useQuery({
    page,
    limit: 20,
    search: search || undefined,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Должники
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Реестр должников из базы банкротств
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск по наименованию или ИНН..."
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
          `Найдено: ${data?.total ?? 0} должников`
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
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Должники не найдены</p>
              <p className="text-sm mt-1">Загрузите данные в разделе «Парсер»</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                    <TableHead>Наименование</TableHead>
                    <TableHead>ИНН / ОГРН</TableHead>
                    <TableHead>Регион</TableHead>
                    <TableHead>Дело</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((debtor) => (
                    <TableRow key={debtor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium max-w-xs">
                        <p className="truncate" title={debtor.name}>{debtor.name}</p>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        <div className="text-gray-700 dark:text-gray-300">ИНН: {debtor.inn || "—"}</div>
                        <div className="text-gray-500 text-xs">ОГРН: {debtor.ogrn || "—"}</div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {debtor.region || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-blue-600 dark:text-blue-400">
                        {debtor.caseNumber || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[debtor.caseStatus ?? "active"]}>
                          {STATUS_LABELS[debtor.caseStatus ?? "active"] ?? debtor.caseStatus}
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
    </div>
  );
}
