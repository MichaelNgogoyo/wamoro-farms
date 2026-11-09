#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/michael/wamoro-farms"
mkdir -p "$APP_DIR"
ARCHIVE="$(mktemp /home/michael/.wamoro-deploy.XXXXXX)"
trap 'rm -f "$ARCHIVE"' EXIT

exec 9>"$APP_DIR/.deploy.lock"
if ! flock -n 9; then
  echo "A Wamoro deployment is already running." >&2
  exit 75
fi

cat > "$ARCHIVE"
ARCHIVE_BYTES="$(stat -c '%s' "$ARCHIVE")"
if (( ARCHIVE_BYTES == 0 || ARCHIVE_BYTES > 150000000 )); then
  echo "Deployment archive is empty or exceeds 150 MB." >&2
  exit 1
fi

python3 - "$ARCHIVE" <<'PY'
import pathlib
import sys
import tarfile

with tarfile.open(sys.argv[1], "r:gz") as archive:
    for member in archive.getmembers():
        path = pathlib.PurePosixPath(member.name)
        if path.is_absolute() or ".." in path.parts:
            raise SystemExit(f"Refusing unsafe archive path: {member.name}")
        if member.issym() or member.islnk():
            raise SystemExit(f"Refusing archive link: {member.name}")
        if not (member.isfile() or member.isdir()):
            raise SystemExit(f"Refusing special archive entry: {member.name}")
PY

if [[ ! -f "$APP_DIR/.env.production" ]]; then
  echo "Missing $APP_DIR/.env.production; deployment configuration is not installed." >&2
  exit 1
fi

mkdir -p "$APP_DIR/storage/uploads"
tar -xzf "$ARCHIVE" --no-same-owner -C "$APP_DIR"
cd "$APP_DIR"

docker compose --env-file .env.production -f docker-compose.prod.yml up -d db
docker compose --env-file .env.production -f docker-compose.prod.yml build app migrator
docker compose --env-file .env.production -f docker-compose.prod.yml run --rm migrator
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --no-build app

echo "Wamoro Farms deployment completed."
