#!/usr/bin/env bash
#
# CrocHub Database Restore Script
#
# Usage: ./restore-db.sh [backup_file.sql.gz] [options]
# Options:
#   --target [db_name]   Overrides the target database name
#   --yes                Auto-confirm restore (non-interactive automation mode)
#   --force              Allows running in production environments
#

set -euo pipefail

BACKUP_FILE="${1:-}"
TARGET_DB_OVERRIDE=""
AUTO_CONFIRM=false
FORCE_PROD=false

# Simple CLI option parser
shift || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET_DB_OVERRIDE="$2"
      shift 2
      ;;
    --yes)
      AUTO_CONFIRM=true
      shift
      ;;
    --force)
      FORCE_PROD=true
      shift
      ;;
    *)
      echo "[ERROR] Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "========================================="
echo "🐊 CrocHub MySQL DB Restore Automation"
echo "========================================="

# 1. Validation & Input checks
if [ -z "${BACKUP_FILE}" ]; then
  echo "[ERROR] No backup file specified!"
  echo "Usage: ./restore-db.sh [backup_file.sql.gz] [--target override_db] [--yes] [--force]"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[ERROR] Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

# 2. Try loading credentials from .env files
ENV_FILE=""
if [ -f "./.env" ]; then
  ENV_FILE="./.env"
elif [ -f "../.env" ]; then
  ENV_FILE="../.env"
elif [ -f "../../.env" ]; then
  ENV_FILE="../../.env"
fi

NODE_ENV_VAL="development"
if [ -n "${ENV_FILE}" ]; then
  echo "[INFO] Loading environment variables from: ${ENV_FILE}"
  set -a
  source <(grep -v '^#' "${ENV_FILE}" | grep -v '^[[:space:]]*$')
  set +a
  NODE_ENV_VAL="${NODE_ENV:-development}"
fi

# Resolve DB Target
DB_NAME="${TARGET_DB_OVERRIDE:-${MYSQL_DATABASE:-}}"
DB_USER="${MYSQL_USER:-root}"
DB_PASS="${MYSQL_PASSWORD:-}"
DB_HOST="${MYSQL_HOST:-localhost}"
DB_PORT="${MYSQL_PORT:-3306}"

if [ -z "${DB_NAME}" ]; then
  echo "[ERROR] Target database is not resolved. Set MYSQL_DATABASE in env or pass --target."
  exit 1
fi

# 3. Production Environment Safeguards
if [ "${NODE_ENV_VAL}" = "production" ] && [ "${FORCE_PROD}" = false ]; then
  echo "[CRITICAL] Target environment is PRODUCTION!"
  echo "[CRITICAL] Restoring on production without --force is strictly forbidden."
  exit 1
fi

# 4. Checksum verification if checksum file exists
CHECKSUM_FILE="${BACKUP_FILE}.md5"
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "[INFO] Found checksum file: ${CHECKSUM_FILE}. Verifying data integrity..."
  if command -v md5 >/dev/null 2>&1; then
    # md5 on macOS prints "MD5 (file) = hash"
    CALC_MD5=$(md5 -q "${BACKUP_FILE}")
    EXP_MD5=$(cat "${CHECKSUM_FILE}" | awk '{print $1}')
    if [ "${CALC_MD5}" != "${EXP_MD5}" ]; then
      echo "[ERROR] Checksum verification failed! File may be corrupted."
      echo "Expected: ${EXP_MD5}, Calculated: ${CALC_MD5}"
      exit 1
    fi
    echo "[INFO] Checksum verified successfully. Data is sound."
  elif command -v md5sum >/dev/null 2>&1; then
    if md5sum --status -c "${CHECKSUM_FILE}"; then
      echo "[INFO] Checksum verified successfully. Data is sound."
    else
      echo "[ERROR] Checksum verification failed!"
      exit 1
    fi
  else
    echo "[WARNING] No md5 utility found. Skipping verification."
  fi
else
  echo "[WARNING] No checksum file found at ${CHECKSUM_FILE}. Proceeding with caution..."
fi

# 5. Interactive confirmation (if not --yes or in non-interactive shell)
if [ "${AUTO_CONFIRM}" = false ]; then
  echo "[WARNING] This script will OVERWRITE/RESTORE the database: '${DB_NAME}'!"
  echo "[WARNING] Are you absolutely sure you want to proceed? (y/N)"
  read -r CONFIRM
  if [[ ! "${CONFIRM}" =~ ^[yY]([eE][sS])?$ ]]; then
    echo "[INFO] Restoration cancelled by user."
    exit 0
  fi
fi

# 6. Detect Docker Mode vs Local Mode
IS_DOCKER=false
if docker compose ps | grep -q "db"; then
  IS_DOCKER=true
  echo "[INFO] Containerized Mode detected (Docker service 'db' is active)."
else
  echo "[INFO] Local Mode detected (Docker container 'db' not active)."
fi

# 7. Execute restoration
echo "[INFO] Restoring database '${DB_NAME}' from gzipped file..."

# Decompress gzipped content to memory and stream straight to database client safely
if [ "${IS_DOCKER}" = true ]; then
  ROOT_PASS="${MYSQL_ROOT_PASSWORD:-$DB_PASS}"
  
  # Ensure target database exists in container
  if [ -n "${ROOT_PASS}" ]; then
    docker compose exec -T db mysql -u root -p"${ROOT_PASS}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"
    gunzip -c "${BACKUP_FILE}" | docker compose exec -T db mysql -u root -p"${ROOT_PASS}" "${DB_NAME}"
  else
    docker compose exec -T db mysql -u "${DB_USER}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"
    gunzip -c "${BACKUP_FILE}" | docker compose exec -T db mysql -u "${DB_USER}" "${DB_NAME}"
  fi
else
  # Local Mode
  if [ -n "${DB_PASS}" ]; then
    MYSQL_PWD="${DB_PASS}" mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"
    gunzip -c "${BACKUP_FILE}" | MYSQL_PWD="${DB_PASS}" mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" "${DB_NAME}"
  else
    mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;"
    gunzip -c "${BACKUP_FILE}" | mysql -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" "${DB_NAME}"
  fi
fi

echo "-----------------------------------------"
echo "✅ DB Restoration successfully completed!"
echo "📍 Target Database: ${DB_NAME}"
echo "========================================="
