import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "recharts";
import {
  TrendingDown,
  BarChart2,
  Layers,
  MapPin,
  Info,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];

const STAGE_COLORS: Record<string, string> = {
  "Первые торги": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "Повторные торги": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  "Публичное предложение": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

function discountColor(discount: number) {
  if (discount >= 70) return "text-green-600 dark:text-green-400";
  if (discount >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-gray-600 dark:text-gray-400";
}

export default function Analysis() {
  const analysisQ = trpc.parser.analysis.useQuery();
  const analysis = analysisQ.data;
  const loading = analysisQ.isLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-green-600" />
          Аналитика рынка
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Анализ дебиторской задолженности на торгах по банкротству
        </p>
      </div>

      {/* Intro card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-semibold">Как работает дебиторская задолженность на торгах</p>
              <p className="text-blue-700 dark:text-blue-400">
                На торгах продаётся <strong>право требования долга</strong> — вы покупаете долг
                третьего лица (дебитора) по цене ниже номинала. После покупки вы можете
                взыскать полную сумму через суд.
              </p>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="text-xs bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2">
                  <span className="font-bold">Первые торги</span> — 100% от начальной цены
                </div>
                <div className="text-xs bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2">
                  <span className="font-bold">Повторные</span> — цена снижается на 10-20%
                </div>
                <div className="text-xs bg-white/50 dark:bg-black/20 rounded-lg px-3 py-2">
                  <span className="font-bold">Публичное предложение</span> — максимальный дисконт
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key metrics */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500">Проанализировано лотов</p>
              <p className="text-3xl font-bold mt-1">{analysis.totalAnalyzed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500">Средняя скидка</p>
              <p className={`text-3xl font-bold mt-1 ${discountColor(analysis.avgDiscount)}`}>
                {analysis.avgDiscount}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500">Типов долгов</p>
              <p className="text-3xl font-bold mt-1">{analysis.typeData.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500">Стадий торгов</p>
              <p className="text-3xl font-bold mt-1">{analysis.stageData.length}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {analysis && analysis.totalAnalyzed === 0 && (
        <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
          <CardContent className="py-12 text-center text-gray-500">
            <BarChart2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Нет данных для анализа</p>
            <p className="text-sm mt-1">Загрузите лоты в разделе «Парсер»</p>
          </CardContent>
        </Card>
      )}

      {analysis && analysis.totalAnalyzed > 0 && (
        <>
          {/* Discount histogram */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-600" />
                Распределение скидок от номинала долга
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={analysis.discountHistogram}
                  margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v} лотов`, "Количество"]}
                    contentStyle={{ fontSize: 13 }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    {analysis.discountHistogram.map((_, idx) => {
                      const discount = idx * 10 + 5;
                      const color = discount >= 70 ? "#10b981" : discount >= 40 ? "#f59e0b" : "#3b82f6";
                      return <Cell key={idx} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                  Низкая скидка (&lt;40%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                  Средняя (40-70%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                  Высокая (&gt;70%)
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stage distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-600" />
                  Стадии торгов
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analysis.stageData}
                      dataKey="count"
                      nameKey="stage"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {analysis.stageData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v} лотов`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {analysis.stageData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        <Badge
                          variant="outline"
                          className={STAGE_COLORS[item.stage] || ""}
                        >
                          {item.stage}
                        </Badge>
                      </div>
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Type distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Типы долговых обязательств</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={analysis.typeData}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 80, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="type"
                      type="category"
                      tick={{ fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Regional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Региональное распределение
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={analysis.topRegions}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 140, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="region"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={140}
                  />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strategy tips */}
          <Card className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-800/50">
            <CardHeader>
              <CardTitle className="text-base">Стратегия инвестирования в дебиторскую задолженность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <div className="text-2xl">🎯</div>
                  <h4 className="font-semibold text-sm">Проверка дебитора</h4>
                  <p className="text-xs text-gray-500">
                    Проверьте ИНН дебитора в ЕГРЮЛ, арбитражных делах и ФССП.
                    Активные компании с активами — лучший выбор.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <div className="text-2xl">⚖️</div>
                  <h4 className="font-semibold text-sm">Судебная перспектива</h4>
                  <p className="text-xs text-gray-500">
                    Долги с судебным решением взыскиваются легче.
                    Долги в исполнительном производстве — уже на финишной прямой.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <div className="text-2xl">📊</div>
                  <h4 className="font-semibold text-sm">Оптимальная скидка</h4>
                  <p className="text-xs text-gray-500">
                    Скидка 50-70% при хорошей взыскиваемости даёт ROI 100-200%.
                    Публичное предложение часто лучшее время для входа.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
