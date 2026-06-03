#!/bin/sh
# Deployment setup script for Coolify

set -e

echo "Running database migrations..."
if [ -z "${DATABASE_URL}" ]; then
  echo "Error: DATABASE_URL is not set. Cannot run Prisma migrations."
  exit 1
fi

echo "DATABASE_URL is set, proceeding with migration..."
node_modules/.bin/prisma migrate deploy --schema=prisma/schema.prisma

echo "Starting the Next.js application..."
exec node server.js
