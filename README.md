# Парсер лотов по банкротству (MVP)

Минимально жизнеспособный продукт для работы с торгами по банкротству. Собирает и отображает дебиторскую задолженность из ЕФРСБ (fedresurs.ru).

## Стек технологий

- **Frontend**: React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: tRPC + Hono + Drizzle ORM
- **Database**: PostgreSQL (Supabase-ready)
- **Deployment**: Vercel

## Структура проекта

```
├── api/                    # Backend (tRPC + Hono)
│   ├── routers/
│   │   ├── lots.ts         # CRUD для лотов
│   │   ├── debtors.ts      # CRUD для должников
│   │   ├── auctionNotices.ts  # Объявления торгов
│   │   └── parser.ts       # Генерация/очистка данных
│   ├── queries/
│   │   └── connection.ts   # Подключение к PostgreSQL
│   ├── router.ts           # Регистрация роутеров
│   ├── middleware.ts       # tRPC middleware
│   └── boot.ts             # Entry point сервера
├── db/
│   ├── schema.ts           # Схема БД (debtors, auctionNotices, lots)
│   └── relations.ts        # Drizzle relations
├── src/
│   ├── pages/              # Страницы (Dashboard, Lots, Debtors, Parser)
│   ├── components/         # Layout и UI
│   └── providers/trpc.tsx  # tRPC клиент (без кеша)
├── vercel.json             # Конфигурация Vercel
└── .env                    # Переменные окружения
```

## Быстрый старт

### 1. Локальная разработка

```bash
# Установка зависимостей
npm install

# Синхронизация схемы с БД
npm run db:push

# Запуск dev сервера
npm run dev
```

### 2. Подключение Supabase (PostgreSQL)

1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите `Connection String` из раздела Settings > Database
3. Обновите `DATABASE_URL` в `.env`:

```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 3. Деплой на Vercel

#### Вариант A: Через Vercel CLI

```bash
# Установить Vercel CLI
npm i -g vercel

# Залогиниться
vercel login

# Деплой
vercel --prod
```

#### Вариант B: Через Git + Vercel Dashboard

1. Запушьте код на GitHub
2. Импортируйте проект в [Vercel Dashboard](https://vercel.com/dashboard)
3. Добавьте переменную окружения `DATABASE_URL`
4. Нажмите Deploy

### 4. Подключение реального API ЕФРСБ

Для работы с реальными данными:

1. Получите доступ к [Fedresurs REST API](https://bank-publications-demo.fedresurs.ru/swagger/index.html)
2. Замените `parser.ts` роутер на реальный клиент API:
   - Тестовый контур: `https://bank-publications-demo.fedresurs.ru`
   - Логин: `demowebuser` / Пароль: `Axl761BN`
3. Для продуктивного доступа заключите договор с ФНС России

## API Endpoints (tRPC)

| Endpoint | Описание |
|----------|----------|
| `lots.list` | Список лотов с фильтрами и пагинацией |
| `lots.getById` | Детали лота по ID |
| `debtors.list` | Список должников с поиском |
| `debtors.getById` | Детали должника по ID |
| `auctionNotices.list` | Объявления торгов |
| `parser.generateDemoData` | Генерация демо-данных |
| `parser.clearAll` | Очистка всех данных |
| `parser.stats` | Статистика базы |

## Кеш-контроль

Для предотвращения проблем с кешем на Vercel:

- **tRPC клиент**: настроен с `staleTime: 0`, `gcTime: 0`, `refetchOnWindowFocus: true`
- **HTTP заголовки**: `Cache-Control: no-cache, no-store, must-revalidate`
- **Fetch**: используется `cache: "no-store"` для всех tRPC запросов
- **Vercel конфиг**: `vercel.json` с заголовками для отключения кеша

## Демо-данные

Для демонстрации работы используйте страницу "Парсер" → "Сгенерировать".
Данные создаются в структуре, полностью повторяющей формат ЕФРСБ:
- Должники с реалистичными ИНН, ОГРН, адресами
- Объявления торгов с датами, ценами, описаниями
- Лоты дебиторской задолженности
