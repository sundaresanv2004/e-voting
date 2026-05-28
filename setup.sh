#!/bin/bash
# Deployment setup script for Coolify

# Run Prisma database migrations
npx prisma migrate deploy
