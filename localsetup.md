# Local Deployment Setup Guide (Computer Lab)

This document outlines the architecture, configuration, and setup process for hosting the E-Voting application locally in a computer lab. This strategy is designed to bypass school proxy blocks, ensure maximum resilience against power cuts, and provide a seamless experience for students.

## 1. The Core Strategy
- **Server:** One powerful Windows computer in the lab acts as the server, running the application via Docker Compose.
- **Clients:** The remaining computers in the lab act as voting terminals, connecting to the server over the local network.
- **Reverse Proxy:** An NGINX container sits in front of the Next.js application, listening on port 80 (HTTP) and cleanly routing traffic.

## 2. Network & URL Configuration (The Hostname Approach)
To avoid rebuilding the Docker containers every time the server's IP address changes (e.g., after a power cut), we use a custom local hostname instead of raw IP addresses.

### The Setup
1. **`BETTER_AUTH_URL`**: Hardcoded to `http://localhost` in `docker-compose.yml`. Since this is only used internally by the server, it never breaks when the IP changes.
2. **`NEXT_PUBLIC_APP_URL`**: Set to `http://evote` in the `.env` file. This is the URL baked into the application for the browser to use.
3. **Windows Hosts File**: On **every machine** in the lab (the server and all clients), you must map the server's current IP address to the `evote` hostname.

### How to Edit the Windows Hosts File
1. Open **Notepad** as an Administrator.
2. Open the file: `C:\Windows\System32\drivers\etc\hosts`
3. Add this line at the bottom (replace the IP with the server's actual IP):
   ```
   192.168.1.50   evote
   ```
4. Save the file.
5. Students can now simply type `http://evote` into Chrome/Edge to access the voting portal.

*If the power cuts and the server gets a new IP, you simply update the IP address in the hosts file on all machines. No Docker rebuild is required.*

## 3. Database Durability & Power Cut Protection
Sudden power loss is a major concern in a local lab. The system is designed to guarantee data integrity:

- **Atomic Transactions:** Every ballot submission is wrapped in a Prisma `$transaction`. A vote is either 100% saved or 100% rolled back. There are no half-votes.
- **PostgreSQL Crash-Safety:** A custom `postgres/postgresql.conf` file is mounted into the database container. It enforces strict crash-safety rules:
  - `fsync = on`: Forces physical disk writes before confirming success.
  - `synchronous_commit = on`: Waits for the Write-Ahead Log (WAL) to be flushed.
- **Auto-Recovery:** `docker-compose.yml` uses `restart: unless-stopped`. When the computer boots up, Docker starts, PostgreSQL replays its transaction log to fix any interrupted states, and the system comes back online automatically.

## 4. Security Modifications for HTTP
Because the lab operates on a closed local network without SSL certificates (HTTPS), several security configurations were adapted:

- **`LOCAL_LAB_MODE="true"`**: Setting this in the `.env` file disables the strict `Secure` flag on cookies (`voter_session` and Better Auth). This allows students and admins to log in over plain HTTP without browsers blocking the cookies.
- **CSP Headers:** The `upgrade-insecure-requests` directive in the Content Security Policy is disabled when `LOCAL_LAB_MODE` is active, preventing browsers from forcefully upgrading local network traffic to HTTPS and breaking API calls.
- **Admin Dashboard & API:** The application remains fully secured. Server Actions and protected routes verify the session JWT on the server side.

### ⚠️ Known Limitation: Google OAuth
Google strictly forbids OAuth logins over `http://` unless the domain is exactly `localhost`. When admins attempt to log into the dashboard via `http://evote`, Google will block the attempt. 
**Solution:** Administrators must use the standard Email and Password login method when managing the system locally.

## 5. Developer Checklist for Election Day
1. Find the Server's IP (`ipconfig`).
2. Update the `hosts` file on all machines with the IP.
3. Copy `env.example` to `.env` and verify settings:
   ```env
   NEXT_PUBLIC_APP_URL="http://evote"
   LOCAL_LAB_MODE="true"
   NODE_ENV="production"
   ```
4. Run `docker-compose up -d --build`.
5. Verify access from a student machine via `http://evote`.
