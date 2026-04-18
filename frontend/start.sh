#!/bin/sh
# start.sh

echo "Running database migrations..."
if [ -z "${DATABASE_URL}" ]; then
  echo "Error: DATABASE_URL is not set. Cannot run Prisma migrations."
  exit 1
fi

npx prisma migrate deploy --config=prisma.config.ts --schema=prisma/schema.prisma

echo "Starting the application..."
exec node server.js
