import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Database,
  ExternalLink,
  Info,
  CheckCircle,
} from "lucide-react";
import { demoStats } from "@/lib/demoData";

export default function Parser() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Управление данными
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Генерация демо-данных</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5" />Состояние базы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold">{demoStats.debtors}</div>
              <div className="text-sm text-gray-500">Должников</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold">{demoStats.notices}</div>
              <div className="text-sm text-gray-500">Объявлений</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold">{demoStats.lots}</div>
              <div className="text-sm text-gray-500">Лотов</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />API ЕФРСБ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Для работы с реальными данными:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><a href="https://bank-publications-demo.fedresurs.ru/swagger" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Swagger API Demo</a></li>
              <li><strong>Логин:</strong> demowebuser / <strong>Пароль:</strong> Axl761BN</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300">Готов к деплою</h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">Добавьте DATABASE_URL на Vercel.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
