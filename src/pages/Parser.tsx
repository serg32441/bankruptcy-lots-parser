import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Database,
  Play,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Info,
} from "lucide-react";

export default function Parser() {
  const [count, setCount] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const utils = trpc.useUtils();
  const { data: stats, isLoading: statsLoading } = trpc.parser.stats.useQuery();

  const generateMutation = trpc.parser.generateDemoData.useMutation({
    onSuccess: (data) => {
      setGenerating(false);
      if (data.success) {
        setResult({ type: "success", message: data.message });
      } else {
        setResult({ type: "error", message: data.message });
      }
      utils.parser.stats.invalidate();
      utils.lots.list.invalidate();
      utils.debtors.list.invalidate();
      utils.auctionNotices.list.invalidate();
    },
    onError: (error) => {
      setGenerating(false);
      setResult({ type: "error", message: error.message });
    },
  });

  const clearMutation = trpc.parser.clearAll.useMutation({
    onSuccess: () => {
      setClearing(false);
      setResult({ type: "success", message: "Все данные успешно удалены" });
      utils.parser.stats.invalidate();
      utils.lots.list.invalidate();
      utils.debtors.list.invalidate();
      utils.auctionNotices.list.invalidate();
    },
    onError: (error) => {
      setClearing(false);
      setResult({ type: "error", message: error.message });
    },
  });

  const handleGenerate = () => {
    setGenerating(true);
    setResult(null);
    generateMutation.mutate({ count });
  };

  const handleClear = () => {
    setClearing(true);
    setResult(null);
    clearMutation.mutate();
  };

  const hasData = (stats?.lots ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Управление данными
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Генерация демо-данных и управление базой
        </p>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />
            Текущее состояние базы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? "..." : stats?.debtors ?? 0}
              </div>
              <div className="text-sm text-gray-500">Должников</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? "..." : stats?.notices ?? 0}
              </div>
              <div className="text-sm text-gray-500">Объявлений</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {statsLoading ? "..." : stats?.lots ?? 0}
              </div>
              <div className="text-sm text-gray-500">Лотов</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Message */}
      {result && (
        <Card className={result.type === "success" ? "border-green-300 bg-green-50 dark:bg-green-900/10" : "border-red-300 bg-red-50 dark:bg-red-900/10"}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {result.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <p className={result.type === "success" ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}>
                {result.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Demo Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="w-5 h-5 text-green-600" />
            Генерация демо-данных
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Создаёт реалистичные данные о торгах по банкротству в формате ЕФРСБ (fedresurs.ru).
            Структура данных полностью соответствует реальному API — после можно заменить на реальный парсер.
          </p>

          <div className="flex items-end gap-4">
            <div className="w-32">
              <Label htmlFor="count">Количество</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-green-600 hover:bg-green-700"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Сгенерировать
            </Button>
          </div>

          {hasData && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              База уже содержит данные. Для повторной генерации очистите таблицы.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Clear Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Очистка базы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Удаляет все данные из таблиц: должники, объявления торгов, лоты.
            Операция необратима.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={clearing || !hasData}>
                {clearing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Очистить все данные
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                <AlertDialogDescription>
                  Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.
                  Будут удалены: {stats?.debtors ?? 0} должников, {stats?.notices ?? 0} объявлений,
                  {stats?.lots ?? 0} лотов.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear} className="bg-red-600 hover:bg-red-700">
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Fedresurs API Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            Подключение реального API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              Для работы с реальными данными подключитесь к официальному API ЕФРСБ:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Тестовый контур:</strong>{" "}
                <a
                  href="https://bank-publications-demo.fedresurs.ru/swagger/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Swagger API Demo
                </a>
              </li>
              <li>
                <strong>Логин:</strong> demowebuser / <strong>Пароль:</strong> Axl761BN
              </li>
              <li>
                <strong>Документация:</strong>{" "}
                <a
                  href="https://fedresurs.ru/helps/bankrupt/Service_rest_1.0.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  PDF спецификация REST API
                </a>
              </li>
            </ul>
            <p className="mt-2">
              Для продуктивного доступа необходимо заключить договор с ФНС России.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
