import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Activity,
  TrendingDown,
  Clock,
  Building2,
  Car,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import {
  demoStats,
  demoRecommendations,
  demoChartData,
  demoActualLots,
} from "@/lib/demoData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const categoryButtons = [
  { label: "Недвижимость", icon: Building2 },
  { label: "Авто", icon: Car },
  { label: "Дебиторка", icon: FileText },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Дашборд поиска лотов
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Обзор новых предложений, рисков и ближайших торгов
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Поиск: квартира, авто, дебиторка, ИНН..."
              className="pl-10 w-full lg:w-80"
            />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Создать подборку
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">N</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Новых лотов</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {demoStats.newLots.toLocaleString("ru-RU")}
              </span>
              <span className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                {demoStats.newLotsChange}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">за 24 часа</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">%</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Средний дисконт</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {demoStats.avgDiscount}
              </span>
              <span className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                {demoStats.avgDiscountChange}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">к оценке</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">T</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Торги сегодня</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {demoStats.todayAuctions}
              </span>
              <span className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded">
                {demoStats.urgentAuctions} срочных
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">активных процедур</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Search */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Быстрый поиск
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Соберите подборку по региону, категории, дисконту и сроку окончания торгов.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Например: земельный участок Московская область"
              className="flex-1"
            />
            <div className="flex gap-2">
              {categoryButtons.map((cat) => (
                <Button
                  key={cat.label}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <cat.icon className="w-4 h-4 mr-1" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Рекомендации
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              3 лота выглядят недооценёнными относительно рынка.
            </p>
            <div className="space-y-3">
              {demoRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {rec.title}
                    </p>
                    <p className="text-xs text-gray-500">{rec.location}</p>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    {rec.discount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Динамика найденных лотов
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Публикации за последние 7 дней по выбранным категориям
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demoChartData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                    {demoChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 5 ? "#2563eb" : "#bfdbfe"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actual Lots */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Актуальные лоты
            </h3>
            <span className="text-sm text-gray-500">
              Сортировка: ближе к завершению
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-medium text-gray-500 py-2 pr-4">Лот</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-2 pr-4">Регион</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-2 pr-4">Начальная цена</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-2 pr-4">Дисконт</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-2 pr-4">Окончание</th>
                  <th className="text-left text-xs font-medium text-gray-500 py-2">Статус</th>
                </tr>
              </thead>
              <tbody>
                {demoActualLots.map((lot) => (
                  <tr
                    key={lot.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {lot.title}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                      {lot.region}
                    </td>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900 dark:text-white">
                      {lot.startPrice}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-sm font-medium ${
                          lot.discount.startsWith("-")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {lot.discount}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-600 dark:text-gray-400">
                      {lot.endDate}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          lot.statusColor === "blue"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            : lot.statusColor === "green"
                            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {lot.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
