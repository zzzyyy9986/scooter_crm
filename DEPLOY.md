# Деплой на Ubuntu 20.04 (Docker + Git)

## Что поднимается

| Сервис | Назначение |
|--------|------------|
| **nginx** | Единая точка входа (порт 80): `/` → frontend, `/api` → backend |
| **frontend** | Собранный React (production build) |
| **backend** | Laravel API |
| **mysql** | База данных (только внутри Docker-сети) |

## Требования на сервере

- Ubuntu 20.04 LTS
- Docker Engine + Docker Compose plugin
- Git
- Открытый порт 80 (и 443, если позже добавите SSL)

### Установка Docker (если ещё не установлен)

```bash
sudo apt update
sudo apt install -y git ca-certificates curl

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker
```

## Первый деплой

```bash
# 1. Клонировать репозиторий
git clone <repository-url> scooter-crm
cd scooter-crm

# 2. Создать файл окружения
cp .env.prod.example .env
nano .env
```

Заполните в `.env`:

- `APP_URL` — `http://IP_СЕРВЕРА` или ваш домен
- `APP_KEY` — сгенерируйте:

```bash
docker run --rm php:8.4-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

- `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` — надёжные пароли
- `SEED_DATABASE=true` — для первого запуска с тестовыми данными

```bash
# 3. Запустить деплой
chmod +x deploy.sh
./deploy.sh
```

Откройте в браузере: `http://IP_СЕРВЕРА`

## Обновление после изменений в git

На сервере в каталоге проекта:

```bash
./deploy.sh
```

Скрипт выполнит `git pull`, пересоберёт образы и перезапустит контейнеры.

## Полезные команды

```bash
# Логи всех сервисов
docker compose -f docker-compose.prod.yml logs -f

# Логи backend
docker compose -f docker-compose.prod.yml logs -f backend

# Остановить
docker compose -f docker-compose.prod.yml down

# Остановить и удалить данные БД
docker compose -f docker-compose.prod.yml down -v
```

## Локальная разработка vs production

| | Локально | Production |
|---|----------|------------|
| Compose-файл | `docker-compose.yml` | `docker-compose.prod.yml` |
| Frontend | Vite dev-server (:5173) | Nginx + static build |
| Backend | dev-режим, hot reload | `APP_DEBUG=false`, кэш конфигов |
| Запуск | `docker compose up --build` | `./deploy.sh` |

## SSL (опционально)

Для HTTPS рекомендуется поставить перед Docker либо **Caddy**, либо **nginx** на хосте с Let's Encrypt, либо добавить certbot в отдельный compose-сервис. Базовая конфигурация проекта отдаёт HTTP на порту 80.
