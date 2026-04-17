#!/bin/sh
# start.sh

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting the application..."
exec node server.js
