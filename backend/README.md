# FreelanceGuard Escrow — Backend (Team README)
## 0) Коротко что это
Off-chain backend для MVP FreelanceGuard Escrow. Хранит метаданные сделок и файлы, делает Web3-авторизацию через подпись сообщения. Средствами не управляет. On-chain логика живёт в смарт-контракте, фронт работает с контрактом напрямую и связывает on-chain сделку с off-chain карточкой через chainId и onChainDealId.
## 1) Стек
Node.js 20+, NestJS, TypeScript, Prisma, PostgreSQL 16, Docker Compose.
## 2) Рекомендуемые инструменты
IDE: VS Code.
Расширения VS Code:
- ESLint
- Prettier
- Prisma
- Docker
- EditorConfig
- REST Client (опционально для ручных запросов)
## 3) Требования к окружению
Windows x64: Docker Desktop AMD64.
Node.js: 20 LTS.
Порты по умолчанию:
- API: 3000
- PostgreSQL: 5433 (проброшен из контейнера)
## 4) Быстрый запуск для фронта/тестов
1) Открыть репозиторий и перейти в папку backend.
cd backend

Установить зависимости.
npm install

Создать файл .env в backend.
env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/freelanceguard?schema=public"
JWT_SECRET="change-me"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN=http://localhost:5173

Поднять базу данных.
docker compose up -d

Применить миграции и сгенерировать Prisma Client.
npx prisma migrate dev
npx prisma generate

Запустить backend.
npm run start:dev

## 5) Полезные команды разработки
Запуск линтера:
npm run lint

Фикс линтера:
npm run lint:fix

Форматирование:
npm run format

Prisma Studio:
npx prisma studio

Перегенерация Prisma Client:
npx prisma generate

Остановка базы:
docker compose down

## 6) URLs
Health: http://localhost:3000/health
Swagger: http://localhost:3000/docs

## 7) Модель данных (важное для фронта)
User: address (уникальный), nonce (одноразовый).

Deal: title, description, clientId, freelancerId, arbiter, amount, fee, deadlineTs(BigInt unix timestamp), chainId(Int), onChainDealId(String), status.

File: filename, mimeType, size, url.

DealFile: связь many-to-many.

Примечание: amount и fee передаются строками. deadlineTs передаётся строкой-числом и хранится как BigInt. Связка chainId + onChainDealId уникальна.

## 8) Авторизация Web3 (как делать на фронте)
Шаг 1. Получить nonce и сообщение:

GET /auth/nonce?address=0x...
Ответ:

{ "address": "0x...", "nonce": "...", "message": "FreelanceGuard login nonce: ..." }

Шаг 2. Подписать message кошельком через signMessage.

Шаг 3. Отправить подпись:

POST /auth/verify

Body:

{ "address": "0x...", "signature": "..." }

Ответ:

{ "token": "...", "user": { "id": "...", "address": "0x..." } }

Шаг 4. Использовать токен во всех защищённых запросах:

Authorization: Bearer <token>

## 9) Endpoints
Public:

GET /health

GET /auth/nonce?address=0x...

POST /auth/verify

Protected (Bearer JWT):

Deals:

POST /deals

Создание off-chain карточки сделки.

Body пример:
{
  "title": "Landing",
  
  "description": "MVP",
  
  "freelancerAddress": "0x...",
  
  "arbiter": "0x...",
  
  "amount": "100",
  
  "fee": "2",
  
  "deadlineTs": "1766232000",
  
  "chainId": 11155111,
  
  "onChainDealId": null
  
}

GET /deals/mine

Список сделок пользователя как client или freelancer.

GET /deals/:id

Детали сделки с файлами.

PATCH /deals/:id

Обновление метаданных, доступ только client.

PATCH /deals/:id/link-onchain

Связка с on-chain сделкой после создания в контракте.

Body:

{ "chainId": 11155111, "onChainDealId": "42" }

POST /deals/:id/files/:fileId

Привязка файла к сделке, доступ участникам сделки.

Files:

POST /files

multipart/form-data, поле file.

GET /files/:id

Метаданные файла.

GET /files/:id/download

Скачивание файла.

## 10) Рекомендованный ручной прогон для команды

GET /health

GET /auth/nonce

Подписать message кошельком

POST /auth/verify

В Swagger нажать Authorize и вставить Bearer token

POST /deals

GET /deals/mine

POST /files

POST /deals/:id/files/:fileId

PATCH /deals/:id/link-onchain

## 11) Правила разработки в команде
Работаем через ветки и PR.
Не коммитим .env, node_modules, dist, uploads, pgdata.
Перед PR проверяем npm run lint и запуск npm run start:dev.
Описание PR включает список изменённых эндпоинтов и миграций Prisma.

::contentReference[oaicite:0]{index=0}
