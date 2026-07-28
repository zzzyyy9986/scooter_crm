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

if [ -z "${APP_KEY:-}" ]; then
  echo "APP_KEY не задан в .env"
  echo "Сгенерируйте ключ:"
  echo "  docker run --rm php:8.4-cli php -r \"echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;\""
  exit 1
fi

if [ -z "${MYSQL_PASSWORD:-}" ] || [ -z "${MYSQL_ROOT_PASSWORD:-}" ]; then
  echo "Задайте MYSQL_PASSWORD и MYSQL_ROOT_PASSWORD в .env"
  exit 1
fi

echo "==> Обновление кода из git..."
git pull --ff-only

echo "==> Сборка и запуск контейнеров..."
docker compose -f docker-compose.prod.yml --env-file .env up -d --build --remove-orphans

echo "==> Статус сервисов:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "Готово. Приложение доступно по адресу: ${APP_URL:-http://localhost}"
