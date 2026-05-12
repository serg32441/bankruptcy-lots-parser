import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Play,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Info,
} from "lucide-react";
import { demoStats } from "@/lib/demoData";
import { useApiStatus } from "@/hooks/useApiStatus";

export default function Parser() {
  const apiConnected = useApiStatus();
  const stats = demoStats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Управление данными
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Генерация демо-данных и управление базой
          {apiConnected === false && <span className="text-amber-500 ml-2">(офлайн режим)</span>}
        </p>
      </div>

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
                {stats.debtors}
              </div>
              <div className="text-sm text-gray-500">Должников</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.notices}
              </div>
              <div className="text-sm text-gray-500">Объявлений</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.lots}
              </div>
              <div className="text-sm text-gray-500">Лотов</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!apiConnected && (
        <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-300">
                  Офлайн режим
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Backend API недоступен. Сейчас показаны демо-данные, встроенные в приложение.
                  Для полной функциональности подключите PostgreSQL базу и перезапустите сервер.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={apiConnected === false ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="w-5 h-5 text-green-600" />
            Генерация демо-данных
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Создаёт реалистичные данные о торгах по банкротству в формате ЕФРСБ (fedresurs.ru).
          </p>
          <Button disabled={apiConnected !== true} className="bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-2" />
            Сгенерировать
          </Button>
          {apiConnected === false && (
            <p className="text-xs text-gray-400">Требуется подключение к backend</p>
          )}
        </CardContent>
      </Card>

      <Card className={apiConnected === false ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Очистка базы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Удаляет все данные из таблиц. Операция необратима.
          </p>
          <Button variant="destructive" disabled={apiConnected !== true}>
            <Trash2 className="w-4 h-4 mr-2" />
            Очистить все данные
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            Подключение реального API ЕФРСБ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Для работы с реальными данными подключитесь к официальному API ЕФРСБ:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <strong>Тестовый контур:</strong>{" "}
                <a href="https://bank-publications-demo.fedresurs.ru/swagger/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Swagger API Demo
                </a>
              </li>
              <li><strong>Логин:</strong> demowebuser / <strong>Пароль:</strong> Axl761BN</li>
              <li>
                <strong>Документация:</strong>{" "}
                <a href="https://fedresurs.ru/helps/bankrupt/Service_rest_1.0.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  PDF спецификация REST API
                </a>
              </li>
            </ul>
            <p className="mt-2">Для продуктивного доступа необходимо заключить договор с ФНС России.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300">
                Готов к деплою
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Проект полностью готов для деплоя на Vercel. Добавьте переменную окружения
                DATABASE_URL в настройках проекта на Vercel и backend автоматически подключится к базе.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
