# Scooter CRM — прототип внутренней CRM-системы

Прототип для управления самокатами и арендами.

## Стек технологий

| Слой | Технология | Обоснование |
|------|-----------|-------------|
| Backend | **Laravel 11** + PHP 8.2 | Быстрая разработка REST API, встроенная валидация, миграции, Eloquent ORM |
| База данных | **MySQL 8** | Надёжная реляционная СУБД, хорошо интегрируется с Laravel |
| Frontend | **React 18** + **Vite** | Современный SPA с быстрой сборкой |
| State management | **MobX** | Простое реактивное управление состоянием без boilerplate Redux |
| Инфраструктура | **Docker Compose** | Единая команда для запуска всех сервисов на macOS (M1/M2) |

Аутентификация реализована через **Laravel Sanctum** (Bearer token).

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

Тестовый пользователь (создаётся seeder):
- Email: `admin@scooter-crm.local`
- Password: `password`

## Adminer (просмотр БД)

Web-интерфейс: http://localhost:8080

Параметры подключения:
- System: **MySQL**
- Server: **mysql**
- Username: **scooter**
- Password: **scooter**
- Database: **scooter_crm**

## Требования

- Docker Desktop для macOS (Apple Silicon)
- Git

## Быстрый запуск

```bash
git clone <repository-url> scooter-crm
cd scooter-crm
docker compose up --build
```

Первый запуск занимает 3–5 минут (скачивание образов, `composer install`, `npm install`, миграции и сиды).

После запуска:

| Сервис | URL |
|--------|-----|
| Frontend (React) | http://localhost:5173 |
| Backend API | http://localhost:8000/api |
| Adminer (БД) | http://localhost:8080 |
| MySQL | localhost:3306 |

### Проверка API

```bash
curl http://localhost:8000/api/analytics
curl http://localhost:8000/api/scooters
curl http://localhost:8000/api/rentals
```

## Остановка

```bash
docker compose down
```

Для полной очистки данных БД:

```bash
docker compose down -v
```

## Деплой на сервер (Ubuntu + Docker)

Инструкция: [DEPLOY.md](DEPLOY.md)

Кратко:

```bash
git clone <repository-url> scooter-crm
cd scooter-crm
cp .env.prod.example .env   # заполнить APP_KEY, пароли, APP_URL
chmod +x deploy.sh
./deploy.sh
```

## Структура проекта

```
scooter-crm/
├── backend/          # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Http/Requests/
│   │   ├── Models/
│   │   └── Services/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/         # React + MobX + Vite
│   └── src/
│       ├── pages/
│       ├── stores/
│       └── api/
└── docker-compose.yml
```

## API Endpoints

### Аутентификация
- `POST /api/login` — вход (email, password), возвращает token
- `POST /api/logout` — выход (требует Bearer token)
- `GET /api/user` — текущий пользователь (требует Bearer token)

Все endpoints ниже требуют заголовок `Authorization: Bearer {token}`.

### Аналитика
- `GET /api/analytics` — статистика по самокатам и арендам

### Самокаты
- `GET /api/scooters` — список (query: `search`, `status`)
- `POST /api/scooters` — создание
- `GET /api/scooters/{id}` — просмотр
- `PUT /api/scooters/{id}` — обновление
- `DELETE /api/scooters/{id}` — удаление

### Аренды
- `GET /api/rentals` — список (query: `status`)
- `POST /api/rentals` — создание аренды
- `POST /api/rentals/{id}/complete` — завершение аренды

## Функциональность

### Реализовано
- CRUD самокатов (номер, модель, статус, заряд, координаты)
- Создание и завершение аренд
- Список активных и завершённых аренд
- Дашборд: самокаты по статусам, активные аренды, средний заряд
- Поиск и фильтрация самокатов (базовая, на стороне API)
- Валидация данных на backend
- Тестовые данные (seeder)

### Не реализовано (п.4 ТЗ — по запросу)
- Карта с самокатами
- Real-time обновления (WebSocket/polling)

## Архитектурные решения

- **Service layer** — бизнес-логика в `app/Services/`, контроллеры только вызывают сервисы в try-catch
- **Laravel Sanctum** — token-based аутентификация API
- **MobX stores** — отдельные store для analytics, scooters, rentals
- **Транзакции** — создание/завершение аренды атомарно обновляет статус самоката
- **CORS** — настроен для работы frontend на порту 5173

## Тестовые данные

При первом запуске создаются 6 самокатов и 2 аренды (1 активная, 1 завершённая).

Учётные данные MySQL (только для локальной разработки):
- Database: `scooter_crm`
- User: `scooter` / Password: `scooter`
