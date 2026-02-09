# 🚀 E-Voting Application - Docker & Coolify Deployment Guide

This guide provides step-by-step instructions for deploying the E-Voting application using Docker and Coolify.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your local machine (for testing)
- [Coolify](https://coolify.io/) instance set up and accessible
- Supabase project created with your database configured
- Environment variables ready (see `.env.template`)

## 🐳 Docker Setup

### Files Created

1. **Dockerfile** - Multi-stage build for optimized production deployment
2. **docker-compose.yml** - Docker Compose configuration for Coolify
3. **.env.template** - Environment variable template

### Dockerfile Features

- **Multi-stage build** for smaller image size
- **Node.js 20 Alpine** base image for efficiency
- **Non-root user** for enhanced security
- **Production optimizations** with standalone output
- **Layer caching** for faster rebuilds

## 🛠️ Local Testing (Optional)

Before deploying to Coolify, you can test the setup locally:

### 1. Create `.env` file

```bash
cp env.example .env
```

Edit `.env` and fill in your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key-here
```

### 2. Build and run with Docker Compose

```bash
# Build the image
docker-compose build

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### 3. Access the application

Open your browser and navigate to: `http://localhost:3000`

## ☁️ Coolify Deployment

### Method 1: Using Git Repository (Recommended)

#### Step 1: Push to Git Repository

Ensure your code (including `Dockerfile` and `docker-compose.yml`) is pushed to your Git repository:

```bash
git add Dockerfile docker-compose.yml .env.template DEPLOYMENT.md
git commit -m "Add Docker configuration for Coolify deployment"
git push
```

#### Step 2: Create New Service in Coolify

1. Log into your Coolify dashboard
2. Click **+ New** → **Resource** → **Docker Compose**
3. Select your Git repository
4. Coolify will automatically detect the `docker-compose.yml` file

#### Step 3: Configure Environment Variables

In Coolify's service settings, add the following environment variables:

**Build Time Variables** (check the "Build Time" option):
- `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` = `your-anon-key-here`

**Runtime Variables** (optional):
- `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key-here` (if needed)

> **Important:** Variables prefixed with `NEXT_PUBLIC_` must be available at both build time and runtime since Next.js embeds them during the build process.

#### Step 4: Deploy

1. Click **Deploy** in Coolify
2. Coolify will:
   - Pull your repository
   - Build the Docker image using the Dockerfile
   - Start the container using docker-compose.yml
   - Inject environment variables automatically

#### Step 5: Configure Domain (Optional)

1. Go to **Domains** section in your Coolify service
2. Add your custom domain or use the Coolify-provided subdomain
3. Coolify will automatically set up SSL certificates

### Method 2: Using Docker Image

If you prefer to build locally and push to a registry:

```bash
# Build the image
docker build -t your-registry/e-voting:latest .

# Push to registry
docker push your-registry/e-voting:latest
```

Then in Coolify, create a new service using the image from your registry.

## 🔍 Verification

After deployment, verify your application:

### Health Check

The docker-compose configuration includes a health check that runs every 30 seconds:

```bash
# In Coolify, check the logs to see the health check status
# The app should respond with status code 200
```

### Environment Variables

Verify that environment variables are correctly loaded:

1. Check Coolify logs for any environment-related errors
2. Test the Supabase connection by trying to sign up/login
3. Check browser console for any API connection issues

## 🔧 Troubleshooting

### Build Fails

**Issue:** Build fails with dependency errors

**Solution:**
```bash
# Clear Docker cache and rebuild
docker-compose build --no-cache
```

### Environment Variables Not Working

**Issue:** Supabase connection fails

**Solution:**
1. Ensure `NEXT_PUBLIC_` variables are marked as "Build Time" in Coolify
2. Check that environment variable values don't have trailing spaces
3. Verify Supabase URL and keys are correct
4. Redeploy the service after updating environment variables

### Port Conflicts

**Issue:** Port 3000 already in use

**Solution:**
In `docker-compose.yml`, change the port mapping:
```yaml
ports:
  - "3001:3000"  # Maps host port 3001 to container port 3000
```

### Container Memory Issues

**Issue:** Container runs out of memory

**Solution:**
In `docker-compose.yml`, adjust resource limits:
```yaml
deploy:
  resources:
    limits:
      memory: 2G  # Increase from 1G to 2G
```

## 📊 Monitoring

### View Logs in Coolify

1. Navigate to your service in Coolify dashboard
2. Click on **Logs** tab
3. Enable "Follow logs" to see real-time output

### Resource Usage

Monitor your container's resource usage in Coolify:
- CPU usage
- Memory usage
- Network I/O
- Storage

## 🔄 Updates and Redeployment

When you make changes to your application:

1. **Commit and push changes** to your Git repository
2. In Coolify, click **Restart** or **Redeploy**
3. Coolify will automatically pull the latest code and rebuild

For automatic deployments on push:
- Enable **Auto Deploy** in Coolify service settings
- Coolify will watch your repository and deploy on new commits

## 🔐 Security Best Practices

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Use Coolify's secrets management** for sensitive variables
3. **Rotate keys regularly** - Update Supabase keys periodically
4. **Enable HTTPS** - Use Coolify's built-in SSL/TLS
5. **Review logs** - Check for unauthorized access attempts

## 📝 Environment Variables Reference

| Variable | Required | Build Time | Description |
|----------|----------|------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | ✅ Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ✅ Yes | ✅ Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | ❌ No | Supabase service role key (admin only) |

## 📞 Support

If you encounter issues:

1. Check the [Coolify Documentation](https://coolify.io/docs)
2. Review Docker logs: `docker-compose logs -f`
3. Verify environment variables in Coolify dashboard
4. Check Supabase project status

## 🎉 Success!

Once deployed, your E-Voting application will be:
- ✅ Running in a containerized environment
- ✅ Automatically restarting on failure
- ✅ Health-checked every 30 seconds
- ✅ Accessible via your custom domain (if configured)
- ✅ SSL-secured through Coolify
