#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

DOCKER_USER="zzzyyy589"
BACKEND_IMAGE="${DOCKER_USER}/scooter-crm-backend"
FRONTEND_IMAGE="${DOCKER_USER}/scooter-crm-frontend"
TAG="${1:-latest}"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker не установлен."
  exit 1
fi

echo "==> Сборка backend (${BACKEND_IMAGE}:${TAG})..."
docker build \
  -t "${BACKEND_IMAGE}:${TAG}" \
  -f backend/Dockerfile.prod \
  ./backend

echo "==> Сборка frontend (${FRONTEND_IMAGE}:${TAG})..."
docker build \
  -t "${FRONTEND_IMAGE}:${TAG}" \
  --build-arg VITE_API_URL=/api \
  -f frontend/Dockerfile.prod \
  ./frontend

if [ "${TAG}" != "latest" ]; then
  docker tag "${BACKEND_IMAGE}:${TAG}" "${BACKEND_IMAGE}:latest"
  docker tag "${FRONTEND_IMAGE}:${TAG}" "${FRONTEND_IMAGE}:latest"
fi

echo "==> Публикация образов в Docker Hub..."
docker push "${BACKEND_IMAGE}:${TAG}"
docker push "${FRONTEND_IMAGE}:${TAG}"

if [ "${TAG}" != "latest" ]; then
  docker push "${BACKEND_IMAGE}:latest"
  docker push "${FRONTEND_IMAGE}:latest"
fi

echo ""
echo "Готово."
echo "  ${BACKEND_IMAGE}:${TAG}"
echo "  ${FRONTEND_IMAGE}:${TAG}"
echo ""
echo "На VPS задайте IMAGE_TAG=${TAG} в .env (или оставьте latest) и выполните ./deploy-hub.sh"
