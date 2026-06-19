#!/bin/sh
# Deployment setup script for Coolify

set -e

echo "Running database migrations..."
if [ -z "${DATABASE_URL}" ]; then
  echo "Error: DATABASE_URL is not set. Cannot run Prisma migrations."
  exit 1
fi

# Wait until the database is truly ready to accept connections.
# Docker's healthcheck (pg_isready) only verifies the TCP port is open;
# it does not guarantee Postgres has finished loading config and is ready
# for real queries. This loop retries the actual DB connection.
echo "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY_INTERVAL=2
retries=0
until node -e "
  const net = require('net');
  const s = net.connect({ host: 'db', port: 5432 });
  s.on('connect', () => { s.destroy(); process.exit(0); });
  s.on('error', () => { s.destroy(); process.exit(1); });
  setTimeout(() => { s.destroy(); process.exit(1); }, 3000);
" 2>/dev/null; do
  retries=$((retries + 1))
  if [ "$retries" -ge "$MAX_RETRIES" ]; then
    echo "Error: Database did not become ready after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
    exit 1
  fi
  echo "Database not ready yet, retrying in ${RETRY_INTERVAL}s... (attempt ${retries}/${MAX_RETRIES})"
  sleep "$RETRY_INTERVAL"
done
echo "Database is ready."

echo "DATABASE_URL is set, proceeding with migration..."
node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma

echo "Starting the Next.js application..."
exec node server.js
