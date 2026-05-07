#!/usr/bin/env bash
#
# CrocHub Database Backup Script
#
# Usage: ./backup-db.sh [output_directory]
# Example: ./backup-db.sh ./backups
#

set -euo pipefail

# 1. Configuration & Default Values
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEMP_DUMP_FILE="crochub_temp_${TIMESTAMP}.sql"
FINAL_GZ_FILE="${BACKUP_DIR}/crochub_backup_${TIMESTAMP}.sql.gz"

echo "========================================="
echo "🐊 CrocHub MySQL DB Backup Automation"
echo "========================================="
echo "[INFO] Target output folder: ${BACKUP_DIR}"

# Ensure output directory exists
mkdir -p "${BACKUP_DIR}"

# 2. Try loading credentials from .env files
ENV_FILE=""
if [ -f "./.env" ]; then
  ENV_FILE="./.env"
elif [ -f "../.env" ]; then
  ENV_FILE="../.env"
elif [ -f "../../.env" ]; then
  ENV_FILE="../../.env"
fi

if [ -n "${ENV_FILE}" ]; then
  echo "[INFO] Loading environment variables from: ${ENV_FILE}"
  # Export variables to subshell environment without echoing
  set -a
  # Filter out comments and blank lines, then source
  source <(grep -v '^#' "${ENV_FILE}" | grep -v '^[[:space:]]*$')
  set +a
else
  echo "[WARNING] No .env file found. Relying on shell environment."
fi

# Ensure mandatory vars are present
DB_NAME="${MYSQL_DATABASE:-}"
DB_USER="${MYSQL_USER:-root}"
DB_PASS="${MYSQL_PASSWORD:-}"
DB_HOST="${MYSQL_HOST:-localhost}"
DB_PORT="${MYSQL_PORT:-3306}"

if [ -z "${DB_NAME}" ]; then
  echo "[ERROR] MYSQL_DATABASE variable is not set. Cannot run backup."
  exit 1
fi

# 3. Detect Docker Mode vs Local Mode
IS_DOCKER=false
if docker compose ps | grep -q "db"; then
  IS_DOCKER=true
  echo "[INFO] Running in Containerized Mode (Docker service 'db' is active)."
else
  echo "[INFO] Running in Local Mode (Docker container 'db' not active)."
fi

# 4. Perform Backup (mysqldump)
echo "[INFO] Executing dump database: '${DB_NAME}'..."

if [ "${IS_DOCKER}" = true ]; then
  # Ensure we have the root password or standard password
  # Uses root user inside Docker to prevent permissions constraints
  ROOT_PASS="${MYSQL_ROOT_PASSWORD:-$DB_PASS}"
  
  if [ -n "${ROOT_PASS}" ]; then
    # Execute mysqldump inside MySQL container and stream to local temp file safely
    docker compose exec -T db mysqldump -u root -p"${ROOT_PASS}" "${DB_NAME}" > "${TEMP_DUMP_FILE}"
  else
    docker compose exec -T db mysqldump -u "${DB_USER}" "${DB_NAME}" > "${TEMP_DUMP_FILE}"
  fi
else
  # Local Mode execution
  if [ -n "${DB_PASS}" ]; then
    MYSQL_PWD="${DB_PASS}" mysqldump -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" "${DB_NAME}" > "${TEMP_DUMP_FILE}"
  else
    mysqldump -h "${DB_HOST}" -P "${DB_PORT}" -u "${DB_USER}" "${DB_NAME}" > "${TEMP_DUMP_FILE}"
  fi
fi

# 5. Compress & Checksum Verification
if [ ! -s "${TEMP_DUMP_FILE}" ]; then
  echo "[ERROR] Generated SQL dump is empty. Backup failed."
  rm -f "${TEMP_DUMP_FILE}"
  exit 1
fi

echo "[INFO] Gzipping SQL dump to: ${FINAL_GZ_FILE}"
gzip -c "${TEMP_DUMP_FILE}" > "${FINAL_GZ_FILE}"
rm -f "${TEMP_DUMP_FILE}"

# Generate checksum (MD5 or sha256 depending on availability, md5 is standard for DB checks)
echo "[INFO] Creating MD5 checksum file..."
if command -v md5 >/dev/null 2>&1; then
  md5 -r "${FINAL_GZ_FILE}" > "${FINAL_GZ_FILE}.md5"
elif command -v md5sum >/dev/null 2>&1; then
  md5sum "${FINAL_GZ_FILE}" > "${FINAL_GZ_FILE}.md5"
else
  echo "[WARNING] No md5/md5sum tool found. Skipping checksum creation."
fi

echo "-----------------------------------------"
echo "✅ DB Backup successfully completed!"
echo "📍 Location: ${FINAL_GZ_FILE}"
echo "📍 Size: $(du -sh "${FINAL_GZ_FILE}" | cut -f1)"
echo "📍 Checksum: $(cat "${FINAL_GZ_FILE}.md5" 2>/dev/null || echo 'N/A')"
echo "========================================="
