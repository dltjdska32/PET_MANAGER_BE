#!/bin/sh
set -eu

MONGO_USER="${MONGO_INITDB_ROOT_USERNAME:?}"
MONGO_PASS="${MONGO_INITDB_ROOT_PASSWORD:?}"
RS_MEMBER="${MONGO_RS_MEMBER_HOST:?}"

wait_ping() {
  until mongosh --host mongodb:27017 -u "$MONGO_USER" -p "$MONGO_PASS" --authenticationDatabase admin \
    --eval 'db.adminCommand({ ping: 1 }).ok' --quiet 2>/dev/null; do
    sleep 1
  done
}

wait_ping

mongosh --host mongodb:27017 -u "$MONGO_USER" -p "$MONGO_PASS" --authenticationDatabase admin --quiet --eval "
try {
  if (rs.status().ok === 1) { quit(0); }
} catch (e) {
  rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: '${RS_MEMBER}' }] });
}
"

echo "MongoDB replica set rs0 ready (member: ${RS_MEMBER})"
