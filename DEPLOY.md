# Деплой на VPS (Git + Docker)

## Два режима

| Режим | MySQL | Nginx | Compose-файл |
|-------|-------|-------|--------------|
| **external** | **Docker** (изолирован, порт 3306 не на хосте) | **На VPS** | `docker-compose.prod.external.yml` |
| **standalone** | Docker | Docker | `docker-compose.prod.yml` |

**Рекомендуется external**, если на сервере уже есть Nginx (и, возможно, свой MySQL — мы его **не трогаем**).

---

## External: Nginx на VPS, MySQL в Docker

```
Браузер → Nginx (хост :80) → /api → 127.0.0.1:8000 (backend)
                           → /    → 127.0.0.1:8080 (frontend)
Backend → MySQL (контейнер, только внутри Docker-сети)
```

Системный MySQL на `:3306` **не используется и не изменяется**.

### Требования

- Docker + Docker Compose + Git
- Nginx на хосте

### 1. Клонировать и настроить .env

```bash
git clone https://github.com/zzzyyy9986/scooter_crm.git scooter-crm
cd scooter-crm

cp .env.prod.example .env
nano .env
```

| Переменная | Описание |
|------------|----------|
| `APP_URL` | IP или домен |
| `APP_KEY` | сгенерировать (ниже) |
| `MYSQL_ROOT_PASSWORD` | пароль root для **контейнерного** MySQL |
| `MYSQL_PASSWORD` | пароль пользователя `scooter` |
| `SEED_DATABASE` | `true` — только первый раз |

```bash
docker run --rm php:8.4-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

### 2. Запустить

```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Nginx на хосте

```bash
sudo cp nginx/host.conf.example /etc/nginx/sites-available/scooter-crm
sudo nano /etc/nginx/sites-available/scooter-crm
sudo ln -sf /etc/nginx/sites-available/scooter-crm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Проверка

- `http://APP_URL` в браузере
- Логин: `admin@scooter-crm.local` / `password` (если `SEED_DATABASE=true`)
- Потом: `SEED_DATABASE=false` в `.env`

### Обновление

```bash
./deploy.sh
```

### Команды

```bash
docker compose -f docker-compose.prod.external.yml logs -f
docker compose -f docker-compose.prod.external.yml logs -f backend
docker compose -f docker-compose.prod.external.yml ps
docker compose -f docker-compose.prod.external.yml down
docker compose -f docker-compose.prod.external.yml down -v   # + удалить БД контейнера
```

---

## Standalone: всё в Docker

MySQL, backend, frontend и Nginx — все в контейнерах. Порт 80 занимает Docker-nginx.

В `.env`:

```env
DEPLOY_MODE=standalone
COMPOSE_FILE=docker-compose.prod.yml
HTTP_PORT=80
```

```bash
./deploy.sh
```

---

## Локальная разработка

`docker compose up --build` — см. README.

## SSL

Certbot / Let's Encrypt на **хостовом** Nginx (режим external).
