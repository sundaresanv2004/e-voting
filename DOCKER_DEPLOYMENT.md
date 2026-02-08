# Docker Compose Deployment Guide

## Overview
Your `docker-compose.yaml` is now configured to work in **both local development and production** environments.

## How It Works

### Local Development
- Reads environment variables from `.env` file automatically
- Falls back to shell environment if `.env` doesn't exist
- Default port: 3000

### Production (Qualify, Railway, Render, etc.)
- Environment variables are injected by the hosting platform
- `.env` file is optional (won't fail if missing)
- Port can be customized via `PORT` environment variable

## Required Environment Variables

You **must** set these environment variables in your production platform:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional, for admin operations
```

## Deployment Instructions

### For Platforms Like Qualify, Railway, Render, etc.

1. **Set environment variables** in your platform's dashboard or CLI:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional)

2. **Deploy** using Docker Compose:
   ```bash
   docker compose up --build -d
   ```

3. **Verify** the deployment:
   ```bash
   docker compose logs -f web
   ```

### For Platforms That Use Environment Files

If your platform supports uploading `.env` files, you can:
1. Upload your `.env` file to the platform
2. The `env_file` configuration will automatically load it

### Using Custom Port

Some platforms require a specific port. Set the `PORT` environment variable:
```bash
PORT=8080 docker compose up --build
```

This will expose the app on port 8080 instead of 3000.

## Key Features

✅ **Flexible Environment Loading**: Works with `.env` file (local) or shell environment (production)  
✅ **Optional .env File**: Won't fail if `.env` doesn't exist  
✅ **Custom Port Support**: Use `PORT` environment variable  
✅ **Health Checks**: Automatic health monitoring at `/api/health`  
✅ **Auto-restart**: Container restarts automatically unless manually stopped  

## Troubleshooting

### "Environment variables not set" warning
This is normal if you don't have a `.env` file. Make sure variables are set in your shell or platform dashboard.

### Container fails to start
1. Check logs: `docker compose logs web`
2. Verify all required environment variables are set
3. Ensure Supabase credentials are valid

### Application shows "Internal Server Error"
This usually means environment variables weren't passed correctly during build. Try:
```bash
docker compose down
docker compose build --no-cache
docker compose up
```
