# Scooter CRM — прототип внутренней CRM-системы

Прототип для управления самокатами и арендами.

## Стек технологий

| Слой | Технология | Обоснование |
|------|-----------|-------------|
| Backend | **Laravel 12** + PHP 8.4 | REST API, валидация, миграции, Eloquent ORM |
| База данных | **MySQL 8** | Реляционная СУБД, интеграция с Laravel |
| Frontend | **React 18** + **Vite** | SPA с быстрой сборкой |
| State management | **MobX** | Реактивное управление состоянием |
| Инфраструктура | **Docker Compose** | Запуск всех сервисов одной командой |

Аутентификация — **Laravel Sanctum** (Bearer token).

## Требования

- Docker Desktop (macOS Apple Silicon / Linux)
- Git

## Быстрый запуск (локальная разработка)

```bash
git clone https://github.com/zzzyyy9986/scooter_crm.git scooter-crm
cd scooter-crm

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.development

docker compose up --build
```

Первый запуск занимает 3–5 минут (образы, `composer install`, `npm install`, миграции и сиды).

После запуска:

| Сервис | URL |
|--------|-----|
| Frontend (React) | http://localhost:5173 |
| Backend API | http://localhost:8000/api |
| Adminer (БД) | http://localhost:8080 |
| MySQL | localhost:3306 |

> На странице входа (`/login`) есть ссылка «Adminer — просмотр БД» с параметрами подключения.

### Параметры Adminer

| Поле | Значение |
|------|----------|
| System | MySQL |
| Server | `mysql` |
| Username | `scooter` |
| Password | `scooter` |
| Database | `scooter_crm` |

### Тестовый пользователь

Создаётся seeder при первом запуске:

- Email: `admin@scooter-crm.local`
- Password: `password`

### Остановка

```bash
docker compose down          # остановить контейнеры
docker compose down -v       # + удалить данные MySQL
```

## Переменные окружения

Файлы `.env` **не хранятся в git** — в репозитории только шаблоны.

| Файл | В git | Назначение |
|------|-------|------------|
| `backend/.env.example` | ✅ | Шаблон Laravel (локально) |
| `frontend/.env.example` | ✅ | Шаблон Vite (локально) |
| `.env.prod.example` | ✅ | Шаблон production-деплоя |
| `backend/.env` | ❌ | Локальный backend |
| `frontend/.env.development` | ❌ | Локальный frontend (Vite dev) |
| `frontend/.env.production` | ❌ | Production-сборка frontend |
| `.env` (корень) | ❌ | Production на сервере |

Корневой `.env` для локальной разработки **не нужен** — переменные заданы в `docker-compose.yml`.

> `docker compose` при первом запуске может создать `backend/.env` из `.env.example`, если файла нет. Явное копирование выше — рекомендуемый способ.

## Деплой на сервер (Git + Docker)

**Рекомендуемый режим:** Nginx на VPS, MySQL и приложение в Docker (системный MySQL на `:3306` не затрагивается).

```bash
git clone https://github.com/zzzyyy9986/scooter_crm.git scooter-crm
cd scooter-crm

cp .env.prod.example .env
nano .env   # APP_URL, APP_KEY, MYSQL_* , SEED_DATABASE=true (первый раз)

chmod +x deploy.sh
./deploy.sh

# Nginx на хосте — см. nginx/host.conf.example
sudo cp nginx/host.conf.example /etc/nginx/sites-available/scooter-crm
sudo nano /etc/nginx/sites-available/scooter-crm
sudo ln -sf /etc/nginx/sites-available/scooter-crm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Обновление после `git push`: `./deploy.sh`

На сервере Adminer доступен по адресу **`https://ваш-домен/adminer/`** (ссылка также на странице входа). После обновления `nginx/host.conf.example` перезагрузите Nginx на хосте.

Подробнее (режимы external / standalone, SSL, команды): **[DEPLOY.md](DEPLOY.md)**

### Генерация APP_KEY

```bash
docker run --rm php:8.4-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

## Аутентификация (Sanctum)

```bash
# Получить токен
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scooter-crm.local","password":"password"}'

# Запрос с токеном
curl http://localhost:8000/api/scooters \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Структура проекта

```
scooter-crm/
├── backend/                 # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Http/Requests/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/                # React + MobX + Vite
│   └── src/
│       ├── pages/           # страницы и их компоненты
│       ├── common/          # layout, auth, ui
│       ├── store/           # MobX stores
│       ├── services/        # API-клиент
│       └── types/
├── docker-compose.yml       # локальная разработка (+ Adminer)
├── docker-compose.prod.external.yml
├── deploy.sh
└── nginx/host.conf.example
```

## Схема БД (основное)

- `scooter_models` — справочник моделей (Xiaomi Pro 2, Ninebot Max, …)
- `scooters` — конкретные самокаты (`number`, `scooter_model_id`, статус, заряд, координаты)
- `users` — пользователи CRM (админы, вход по email)
- `clients` — клиенты аренды (имя + телефон)
- `rentals` — аренды (связь с `clients`, не с `users`)

## API Endpoints

### Аутентификация

- `POST /api/login` — вход (email, password), возвращает token
- `POST /api/logout` — выход (Bearer token)
- `GET /api/user` — текущий пользователь (Bearer token)

Все endpoints ниже требуют заголовок `Authorization: Bearer {token}`.

### Аналитика

- `GET /api/analytics` — статистика по самокатам и арендам

### Модели самокатов

- `GET /api/scooter-models` — список моделей
- `POST /api/scooter-models` — добавление модели

### Самокаты

- `GET /api/scooters` — список (query: `search`, `status`)
- `POST /api/scooters` — создание (`scooter_model_id`, …)
- `GET /api/scooters/{id}` — просмотр
- `PUT /api/scooters/{id}` — обновление
- `DELETE /api/scooters/{id}` — удаление

### Аренды

- `GET /api/rentals` — список (query: `status`)
- `POST /api/rentals` — создание аренды
- `POST /api/rentals/{id}/complete` — завершение аренды

## Функциональность

### Реализовано

- CRUD самокатов (номер, модель из справочника, статус, заряд, координаты)
- Справочник моделей самокатов (`scooter_models`)
- Создание и завершение аренд
- Список активных и завершённых аренд
- Дашборд: самокаты по статусам, активные аренды, средний заряд
- Карта самокатов (OpenStreetMap + Leaflet)
- Поиск и фильтрация самокатов (API + debounce на frontend)
- Автообновление через polling (10 сек) на дашборде, списке и карте
- Toast-уведомления об ошибках и успешных действиях
- Валидация данных на backend
- Тестовые данные (seeder)

### Не реализовано

- WebSocket / SSE для real-time (сейчас polling)

## Архитектурные решения

- **Service layer** — бизнес-логика в `app/Services/`, контроллеры вызывают сервисы
- **Laravel Sanctum** — token-based аутентификация API
- **MobX stores** — отдельные store для analytics, scooters, rentals, auth
- **Транзакции** — создание/завершение аренды атомарно обновляет статус самоката
- **CORS** — настроен для frontend на порту 5173 (локально)

## Тестовые данные

При первом запуске создаются 3 модели самокатов, 6 самокатов и 2 аренды (1 активная, 1 завершённая).

Учётные данные MySQL (локальная разработка):

- Database: `scooter_crm`
- User: `scooter` / Password: `scooter`
