#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

OUTPUT="${1:-scooter-crm-vps.tar.gz}"
STAGING="$(mktemp -d)"
BUNDLE_DIR="${STAGING}/scooter-crm"

mkdir -p "${BUNDLE_DIR}/nginx"

cp docker-compose.hub.yml "${BUNDLE_DIR}/"
cp deploy-hub.sh "${BUNDLE_DIR}/"
cp nginx/default.conf "${BUNDLE_DIR}/nginx/"
cp .env.prod.example "${BUNDLE_DIR}/.env.example"

chmod +x "${BUNDLE_DIR}/deploy-hub.sh"

tar -czf "${OUTPUT}" -C "${STAGING}" scooter-crm
rm -rf "${STAGING}"

echo "Создан архив: ${OUTPUT}"
echo ""
echo "На VPS (Git не нужен):"
echo "  scp ${OUTPUT} user@SERVER:/opt/"
echo "  ssh user@SERVER"
echo "  cd /opt && tar xzf ${OUTPUT} && cd scooter-crm"
echo "  cp .env.example .env && nano .env"
echo "  ./deploy-hub.sh"
