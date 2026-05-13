#!/usr/bin/env bash
set -euo pipefail
# Windows bind mount: keyFile 권한/CRLF 이슈 → DB 볼륨 내부로 복사 후 400 + mongodb 소유
KEY_DST=/data/db/mongo-replica.key
mkdir -p /data/db
tr -d '\r' < /secrets/replica.key > "$KEY_DST"
chmod 400 "$KEY_DST"
chown mongodb:mongodb "$KEY_DST" 2>/dev/null || chown 999:999 "$KEY_DST"
exec /usr/local/bin/docker-entrypoint.sh mongod \
  --replSet rs0 \
  --bind_ip_all \
  --keyFile "$KEY_DST"
