#!/bin/bash
# Deployment setup script for Coolify

# Run Prisma database migrations
npx prisma generate
npx prisma migrate deploy
