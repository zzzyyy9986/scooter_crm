#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker не установлен."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin не найден. Установите docker-compose-plugin."
  exit 1
fi

if [ ! -f .env ]; then
  echo "Файл .env не найден."
  echo "Создайте его: cp .env.prod.example .env && nano .env"
  exit 1
fi

# shellcheck disable=SC1091
source .env

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.external.yml}"
DEPLOY_MODE="${DEPLOY_MODE:-external}"

if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY не задан в .env"
  echo "Сгенерируйте ключ:"
  echo "  docker run --rm php:8.4-cli php -r \"echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;\""
  exit 1
fi

if [ -z "${MYSQL_PASSWORD:-}" ]; then
  echo "Задайте MYSQL_PASSWORD в .env"
  exit 1
fi

if [ -z "${MYSQL_ROOT_PASSWORD:-}" ]; then
  echo "Задайте MYSQL_ROOT_PASSWORD в .env"
  exit 1
fi

if [ ! -f frontend/.env.production ]; then
  echo "==> Создание frontend/.env.production..."
fi

echo "==> Обновление frontend/.env.production..."
cat > frontend/.env.production <<EOF
VITE_API_URL=/api
VITE_ADMINER_URL=/adminer/
VITE_ADMINER_DB_USER=${MYSQL_USER:-scooter}
VITE_ADMINER_DB_NAME=${MYSQL_DATABASE:-scooter_crm}
EOF

if [ -d .git ]; then
  echo "==> Обновление кода из git..."
  git pull --ff-only
else
  echo "==> Пропуск git pull: каталог не является git-репозиторием."
fi

echo "==> Режим деплоя: ${DEPLOY_MODE} (${COMPOSE_FILE})"

if [ "${COMPOSE_FILE}" = "docker-compose.prod.external.yml" ]; then
  echo "==> Остановка standalone-контейнеров (nginx на :80), если остались..."
  docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
fi

if [ "${COMPOSE_FILE}" = "docker-compose.prod.yml" ]; then
  if ss -tln 2>/dev/null | grep -q ':80 ' || netstat -tln 2>/dev/null | grep -q ':80 '; then
    echo ""
    echo "ОШИБКА: порт 80 уже занят (вероятно, Nginx на хосте)."
    echo "Используйте режим external в .env:"
    echo "  DEPLOY_MODE=external"
    echo "  COMPOSE_FILE=docker-compose.prod.external.yml"
    echo ""
    exit 1
  fi
fi

echo "==> Сборка и запуск контейнеров..."
docker compose -f "${COMPOSE_FILE}" --env-file .env up -d --build --remove-orphans

echo "==> Статус сервисов:"
docker compose -f "${COMPOSE_FILE}" ps

echo ""
echo "Готово."

if [ "${DEPLOY_MODE}" = "external" ]; then
  echo ""
  echo "Backend:  http://127.0.0.1:${BACKEND_PORT:-8000}"
  echo "Frontend: http://127.0.0.1:${FRONTEND_PORT:-8080}"
  echo ""
  echo "Настройте Nginx на хосте (если ещё не сделано):"
  echo "  cp nginx/host.conf.example /etc/nginx/sites-available/scooter-crm"
  echo "  # отредактируйте server_name, затем:"
  echo "  sudo ln -sf /etc/nginx/sites-available/scooter-crm /etc/nginx/sites-enabled/"
  echo "  sudo nginx -t && sudo systemctl reload nginx"
  echo ""
  echo "Adminer (БД): ${APP_URL:-http://localhost}/adminer/"
  echo "  (нужен location /adminer/ в Nginx — см. nginx/host.conf.example)"
else
  echo "Приложение доступно по адресу: ${APP_URL:-http://localhost}"
fi
