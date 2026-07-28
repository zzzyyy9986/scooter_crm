# Деплой на VPS (Git + Docker)

Клонировать репозиторий и запускать `./deploy.sh`.  
Скрипт делает `git pull`, собирает образы и поднимает контейнеры.

## Два режима

| Режим | Когда использовать | Compose-файл |
|-------|-------------------|--------------|
| **external** | MySQL и Nginx **уже на VPS** | `docker-compose.prod.external.yml` |
| **standalone** | Чистый сервер, всё в Docker | `docker-compose.prod.yml` |

По умолчанию в `.env.prod.example` настроен режим **external**.

---

## External: MySQL и Nginx уже на VPS

Поднимаются только **backend** и **frontend** в Docker.  
Порты слушают только `127.0.0.1` — снаружи отдаёт ваш Nginx на хосте.

```
Браузер → Nginx (хост :80) → /api → 127.0.0.1:8000 (backend)
                           → /    → 127.0.0.1:8080 (frontend)
Backend → MySQL (хост 127.0.0.1:3306)
```

### Требования

- Docker + Docker Compose
- Git
- MySQL на хосте
- Nginx на хосте

### 1. Подготовить MySQL на хосте

```bash
# Отредактируйте пароль в scripts/init-host-mysql.sql, затем:
mysql -u root -p < scripts/init-host-mysql.sql
```

Или вручную: база `scooter_crm`, пользователь `scooter`@`localhost`.

### 2. Клонировать и настроить .env

```bash
git clone https://github.com/zzzyyy9986/scooter_crm.git scooter-crm
cd scooter-crm

cp .env.prod.example .env
nano .env
```

| Переменная | Значение |
|------------|----------|
| `DEPLOY_MODE` | `external` |
| `COMPOSE_FILE` | `docker-compose.prod.external.yml` |
| `APP_URL` | `http://ваш-домен` или IP |
| `APP_KEY` | сгенерировать (см. ниже) |
| `MYSQL_PASSWORD` | пароль пользователя `scooter` в MySQL |
| `SEED_DATABASE` | `true` — только первый раз |

```bash
docker run --rm php:8.4-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

### 3. Запустить приложение

```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. Настроить Nginx на хосте

```bash
sudo cp nginx/host.conf.example /etc/nginx/sites-available/scooter-crm
sudo nano /etc/nginx/sites-available/scooter-crm   # server_name
sudo ln -sf /etc/nginx/sites-available/scooter-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Если порт 80 уже занят другим сайтом — добавьте `location` из `host.conf.example` в существующий `server` или используйте отдельный `server_name`.

### 5. Проверка

```bash
curl -I http://127.0.0.1:8080    # frontend
curl http://127.0.0.1:8000/api/analytics   # 401 без токена — нормально
```

Откройте `APP_URL` в браузере.

**Тестовый вход** (если `SEED_DATABASE=true`):

- Email: `admin@scooter-crm.local`
- Password: `password`

После первого запуска: `SEED_DATABASE=false` в `.env`.

### Обновление

```bash
./deploy.sh
```

### Полезные команды (external)

```bash
docker compose -f docker-compose.prod.external.yml logs -f
docker compose -f docker-compose.prod.external.yml logs -f backend
docker compose -f docker-compose.prod.external.yml ps
docker compose -f docker-compose.prod.external.yml down
```

---

## Standalone: всё в Docker

Для сервера без MySQL/Nginx на хосте. Поднимаются mysql, backend, frontend, nginx в контейнерах.

В `.env`:

```env
DEPLOY_MODE=standalone
COMPOSE_FILE=docker-compose.prod.yml
MYSQL_ROOT_PASSWORD=...
MYSQL_PASSWORD=...
HTTP_PORT=80
```

```bash
git clone https://github.com/zzzyyy9986/scooter_crm.git scooter-crm
cd scooter-crm
cp .env.prod.example .env
nano .env   # переключить на standalone
chmod +x deploy.sh
./deploy.sh
```

Обновление: `./deploy.sh`

```bash
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml down -v   # + удалить данные БД
```

---

## Локальная разработка vs production

| | Локально | Production (external) | Production (standalone) |
|---|----------|----------------------|-------------------------|
| Compose | `docker-compose.yml` | `docker-compose.prod.external.yml` | `docker-compose.prod.yml` |
| MySQL | Docker | **Хост** | Docker |
| Nginx | — | **Хост** | Docker |
| Запуск | `docker compose up --build` | `./deploy.sh` | `./deploy.sh` |

## SSL

Настройте Let's Encrypt на **хостовом** Nginx (certbot) для режима external.

## Альтернатива: Docker Hub

См. `docker-compose.hub.yml`, `publish-images.sh`, `deploy-hub.sh` — опционально, если не хотите собирать на сервере.
