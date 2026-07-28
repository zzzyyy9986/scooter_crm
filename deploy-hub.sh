#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.hub.yml"

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
  echo "Создайте его: cp .env.example .env && nano .env"
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

echo "==> Загрузка образов из Docker Hub (тег: ${IMAGE_TAG:-latest})..."
docker compose -f "${COMPOSE_FILE}" --env-file .env pull

echo "==> Запуск контейнеров..."
docker compose -f "${COMPOSE_FILE}" --env-file .env up -d --remove-orphans

echo "==> Статус сервисов:"
docker compose -f "${COMPOSE_FILE}" ps

echo ""
echo "Готово. Приложение доступно по адресу: ${APP_URL:-http://localhost}"
