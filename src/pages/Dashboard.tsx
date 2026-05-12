import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Gavel,
  Users,
  FileText,
  Database,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { demoStats } from "@/lib/demoData";
import { useApiStatus } from "@/hooks/useApiStatus";

export default function Dashboard() {
  const apiConnected = useApiStatus();

  const { data: apiStats } = trpc.parser.stats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: apiConnected === true,
  });

  const stats = apiConnected && apiStats ? apiStats : demoStats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Дашборд
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Обзор базы торгов по банкротству (ЕФРСБ)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Должники
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {apiConnected === null ? "..." : stats.debtors}
            </div>
            <p className="text-xs text-gray-500 mt-1">В базе</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Объявления торгов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {apiConnected === null ? "..." : stats.notices}
            </div>
            <p className="text-xs text-gray-500 mt-1">Активных торгов</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Gavel className="w-4 h-4" />
              Лоты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {apiConnected === null ? "..." : stats.lots}
            </div>
            <p className="text-xs text-gray-500 mt-1">На торгах</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Категория
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              Дебиторская задолженность
            </div>
            <p className="text-xs text-gray-500 mt-1">Фокус MVP</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gavel className="w-5 h-5 text-blue-600" />
              Просмотр лотов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Просматривайте все лоты по дебиторской задолженности с фильтрами и поиском.
            </p>
            <Link to="/lots">
              <Button className="w-full" variant="outline">
                Перейти к лотам
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              База должников
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Просматривайте информацию о должниках, их делах и имуществе.
            </p>
            <Link to="/debtors">
              <Button className="w-full" variant="outline">
                Перейти к должникам
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Запуск парсера
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Запустите генерацию демо-данных или обновление из ЕФРСБ.
            </p>
            <Link to="/parser">
              <Button className="w-full" variant="outline">
                Управление данными
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                О проекте (MVP)
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                {apiConnected === true
                  ? "Backend подключен. Данные загружаются из PostgreSQL базы."
                  : apiConnected === false
                  ? "Сейчас показаны демо-данные. Для подключения реальной базы настройте DATABASE_URL и перезапустите сервер."
                  : "Проверка подключения к API..."}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 dark:text-green-400">
                  Стек: React + tRPC + Drizzle + PostgreSQL (Supabase-ready)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
