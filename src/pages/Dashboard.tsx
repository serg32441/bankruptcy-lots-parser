import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Gavel,
  Users,
  FileText,
  ArrowRight,
  TrendingDown,
  BarChart2,
  CircleDollarSign,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { trpc } from "@/providers/trpc";

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

function formatCurrency(val: number) {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} млрд ₽`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} млн ₽`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)} тыс. ₽`;
  return `${val.toFixed(0)} ₽`;
}

export default function Dashboard() {
  const statsQ = trpc.parser.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const analysisQ = trpc.parser.analysis.useQuery();

  const stats = statsQ.data;
  const analysis = analysisQ.data;
  const loading = statsQ.isLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Дашборд
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Торги по банкротству — дебиторская задолженность
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4" />Активных лотов
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.activeLots ?? 0}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Дебиторская задолженность</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4" />Объём на торгах
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats?.totalValue ?? 0)}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">Начальные цены</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />Средняя скидка
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisQ.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {analysis?.avgDiscount ?? 0}%
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">От номинала долга</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4" />Должников
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.debtors ?? 0}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">В реестре банкротств</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {analysis && analysis.totalAnalyzed > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Discount histogram */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Распределение скидок от номинала
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analysis.discountHistogram} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v} лотов`, "Количество"]}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stage pie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-600" />
                Стадия торгов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={analysis.stageData}
                    dataKey="count"
                    nameKey="stage"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ stage, percent }) =>
                      `${stage.split(" ")[0]} ${Math.round((percent ?? 0) * 100)}%`
                    }
                    labelLine={false}
                  >
                    {analysis.stageData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} лотов`]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Type bar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Типы долгов</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={analysis.typeData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 60, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Region bar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Топ регионов</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={analysis.topRegions}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 80, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="region" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state / Quick actions */}
      {!analysis?.totalAnalyzed && !analysisQ.isLoading && (
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
          <CardContent className="py-12 text-center">
            <Gavel className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              База данных пуста
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Загрузите данные с ЕФРСБ или сгенерируйте демо-данные
            </p>
            <Link to="/parser">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Перейти к парсеру
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick nav */}
      {(stats?.lots ?? 0) > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Лоты торгов</p>
                  <p className="text-2xl font-bold mt-1">{stats?.lots ?? 0}</p>
                </div>
                <Gavel className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <Link to="/lots" className="mt-4 block">
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  Просмотреть <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Объявления о торгах</p>
                  <p className="text-2xl font-bold mt-1">{stats?.notices ?? 0}</p>
                </div>
                <FileText className="w-8 h-8 text-amber-500 opacity-50" />
              </div>
              <Link to="/notices" className="mt-4 block">
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  Просмотреть <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Анализ рынка</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    -{analysis?.avgDiscount ?? 0}%
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-green-500 opacity-50" />
              </div>
              <Link to="/analysis" className="mt-4 block">
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  Аналитика <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
