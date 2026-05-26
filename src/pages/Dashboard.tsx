import { Link } from "react-router";
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
  Activity,
  Tag,
} from "lucide-react";
import { demoStats } from "@/lib/demoData";

export default function Dashboard() {
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
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Активных лотов</span>
            </div>
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{demoStats.lots}</div>
              <p className="text-sm text-gray-500 mt-1">Дебиторская задолженность</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Объём на торгах</span>
            </div>
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{demoStats.volume}</div>
              <p className="text-sm text-gray-500 mt-1">Начальные цены</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Средняя скидка</span>
            </div>
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{demoStats.discount}</div>
              <p className="text-sm text-gray-500 mt-1">От номинала долга</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Должников</span>
            </div>
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{demoStats.debtors}</div>
              <p className="text-sm text-gray-500 mt-1">В реестре банкротов</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gavel className="w-5 h-5 text-blue-600" />Просмотр лотов
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Все лоты с фильтрами и поиском.</p>
            <Link to="/lots">
              <Button className="w-full" variant="outline">Перейти к лотам <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />База должников
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Информация о должниках.</p>
            <Link to="/debtors">
              <Button className="w-full" variant="outline">Перейти к должникам <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />Парсер
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Управление данными и API.</p>
            <Link to="/parser">
              <Button className="w-full" variant="outline">Управление <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300">О проекте (MVP)</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">Демо-данные в формате ЕФРСБ (fedresurs.ru).</p>
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 dark:text-green-400">React + tRPC + Drizzle + PostgreSQL</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
