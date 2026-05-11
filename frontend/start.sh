#!/bin/sh
# start.sh
set -e

echo "Running database migrations..."
if [ -z "${DATABASE_URL}" ]; then
  echo "Error: DATABASE_URL is not set. Cannot run Prisma migrations."
  exit 1
fi

node node_modules/prisma/build/index.js migrate deploy --schema=prisma/schema.prisma

echo "Starting the application..."
exec node server.js
