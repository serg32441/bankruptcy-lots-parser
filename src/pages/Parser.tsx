import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Database,
  ExternalLink,
  RefreshCw,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Globe,
  Clock,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function Parser() {
  const [progress, setProgress] = useState(0);

  const utils = trpc.useUtils();
  const statsQ = trpc.parser.stats.useQuery();

  const fetchMutation = trpc.parser.fetchFromFedresurs.useMutation({
    onMutate: () => {
      setProgress(20);
    },
    onSuccess: (data) => {
      setProgress(100);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      utils.parser.stats.invalidate();
      utils.lots.list.invalidate();
      utils.debtors.list.invalidate();
      setTimeout(() => setProgress(0), 1500);
    },
    onError: (e) => {
      setProgress(0);
      toast.error(`Ошибка: ${e.message}`);
    },
  });

  const demoMutation = trpc.parser.generateDemoData.useMutation({
    onMutate: () => setProgress(30),
    onSuccess: (data) => {
      setProgress(100);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
      utils.parser.stats.invalidate();
      utils.lots.list.invalidate();
      utils.debtors.list.invalidate();
      setTimeout(() => setProgress(0), 1500);
    },
    onError: (e) => {
      setProgress(0);
      toast.error(`Ошибка: ${e.message}`);
    },
  });

  const clearMutation = trpc.parser.clearAll.useMutation({
    onSuccess: () => {
      toast.success("База данных очищена");
      utils.parser.stats.invalidate();
      utils.lots.list.invalidate();
      utils.debtors.list.invalidate();
    },
    onError: (e) => toast.error(`Ошибка: ${e.message}`),
  });

  const isBusy = fetchMutation.isPending || demoMutation.isPending || clearMutation.isPending;
  const stats = statsQ.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Управление данными
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Загрузка лотов с торгов по банкротству
        </p>
      </div>

      {/* Progress bar */}
      {progress > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Обработка данных...
          </p>
        </div>
      )}

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4" />
            Состояние базы данных
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {statsQ.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))
            ) : (
              <>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats?.debtors ?? 0}</div>
                  <div className="text-sm text-gray-500 mt-1">Должников</div>
                </div>
                <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats?.notices ?? 0}</div>
                  <div className="text-sm text-gray-500 mt-1">Объявлений</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats?.lots ?? 0}</div>
                  <div className="text-sm text-gray-500 mt-1">Лотов</div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ЕФРСБ Fetcher */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Загрузка с ЕФРСБ (fedresurs.ru)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              Загрузка объявлений о торгах (тип: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">Auction2</code>)
              из официального реестра ЕФРСБ.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" /> Demo API
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <Globe className="w-3 h-3" /> bank-publications-demo.fedresurs.ru
              </span>
            </div>
          </div>

          {fetchMutation.data && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              fetchMutation.data.success
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            }`}>
              {fetchMutation.data.success ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p>{fetchMutation.data.message}</p>
                {fetchMutation.data.errors && fetchMutation.data.errors.length > 0 && (
                  <ul className="mt-1 text-xs opacity-75">
                    {fetchMutation.data.errors.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => fetchMutation.mutate({ pageSize: 20, page: 0 })}
              disabled={isBusy}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {fetchMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Globe className="w-4 h-4 mr-2" />
              )}
              Загрузить 20 лотов
            </Button>
            <Button
              variant="outline"
              onClick={() => fetchMutation.mutate({ pageSize: 100, page: 0 })}
              disabled={isBusy}
            >
              Загрузить 100 лотов
            </Button>
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <a
              href="https://bank-publications-demo.fedresurs.ru/swagger"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Swagger документация ЕФРСБ
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Demo data generator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Генератор тестовых данных
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Создаёт реалистичные демо-данные по дебиторской задолженности для тестирования
            платформы без подключения к ЕФРСБ.
          </p>

          {demoMutation.data && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              demoMutation.data.success
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
            }`}>
              {demoMutation.data.success ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <p>{demoMutation.data.message}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => demoMutation.mutate({ count: 50 })}
              disabled={isBusy}
            >
              {demoMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              50 тестовых лотов
            </Button>
            <Button
              variant="outline"
              onClick={() => demoMutation.mutate({ count: 100 })}
              disabled={isBusy}
            >
              100 тестовых лотов
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
            Опасная зона
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Полная очистка базы данных. Все лоты, должники и объявления будут удалены.
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Удалить все данные? Это действие нельзя отменить.")) {
                clearMutation.mutate();
              }
            }}
            disabled={isBusy || (stats?.lots === 0 && stats?.debtors === 0)}
          >
            {clearMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Очистить базу данных
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
