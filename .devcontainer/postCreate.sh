#!/usr/bin/env bash
set -e

echo "==> Installing mysql client inside WP container (for seed import)..."
apt-get update -y >/dev/null 2>&1
DEBIAN_FRONTEND=noninteractive apt-get install -y default-mysql-client curl >/dev/null 2>&1 || true

echo "==> Waiting for DB to be healthy..."
# Espera activa a que la DB acepte conexiones
for i in {1..90}; do
  if mysql -h db -uroot -proot -e "SELECT 1" >/dev/null 2>&1; then
    echo "DB is up."
    break
  fi
  sleep 2
done

DB_NAME="${WORDPRESS_DB_NAME:-wordpress}"

echo "==> Checking if database '$DB_NAME' is empty..."
TABLE_COUNT=$(mysql -h db -uroot -proot -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='${DB_NAME}';" || echo "0")
echo "Tables found: ${TABLE_COUNT}"

SEED_PATH="/workspace/seed/wordpress.sql"

if [ "${TABLE_COUNT}" -eq 0 ]; then
  if [ -f "${SEED_PATH}" ]; then
    echo "==> Importing seed from ${SEED_PATH}..."
    mysql -h db -uroot -proot "${DB_NAME}" < "${SEED_PATH}"
    echo "==> Seed import completed."
  else
    echo "==> No seed file found at ${SEED_PATH}. Skipping import."
  fi
else
  echo "==> Database already has tables. Skipping seed import."
fi

# (Opcional) Puedes instalar WP-CLI si lo quieres disponible:
if ! command -v wp >/dev/null 2>&1; then
  echo "==> Installing WP-CLI..."
  curl -sSLo /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
  chmod +x /usr/local/bin/wp
fi

echo "==> postCreate completed."
