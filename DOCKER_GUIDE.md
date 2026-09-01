# Docker Guide - El Nadhour Cafe

## What is Docker? (Simple Explanation)

Think of Docker like **shipping containers** on a boat:
- Without Docker: you install everything manually on your server (Node.js, PostgreSQL, Nginx...)
- With Docker: each piece of your app runs in its own **container** (a small isolated box)

```
Your VPS Server (the boat)
│
├── Container 1: PostgreSQL (your database)
├── Container 2: Node.js (your API backend)
└── Container 3: Nginx + React (your website)
```

**Why is this useful?**
- One command starts everything: `docker compose up -d`
- One command stops everything: `docker compose down`
- Your app works the same on any server (no "it works on my machine" problems)
- Easy to update: rebuild and restart

---

## Your Project Files (What Each One Does)

```
cafe-app/
├── docker-compose.yml          <-- THE MAIN FILE (defines all 3 containers)
├── .env.production              <-- Template for your passwords
├── .env                         <-- Your actual passwords (create on server)
├── deploy.sh                    <-- First-time deployment script
├── update.sh                    <-- Update script (after code changes)
├── setup-ssl.sh                 <-- HTTPS setup script
│
├── backend/
│   ├── Dockerfile               <-- How to build the backend container
│   └── .dockerignore            <-- Files to exclude from container
│
├── frontend/
│   ├── Dockerfile               <-- How to build the frontend container
│   ├── nginx.conf               <-- Nginx config (inside the container)
│   └── .dockerignore            <-- Files to exclude from container
│
└── nginx/
    └── elnadhour.conf           <-- Nginx config (for non-Docker deployment)
```

---

## How docker-compose.yml Works

This file defines your 3 services. Here's what each part means:

```yaml
services:

  # CONTAINER 1: Database
  db:
    image: postgres:16-alpine     # Use official PostgreSQL image
    restart: always               # Auto-restart if it crashes
    environment:                  # Database credentials
      POSTGRES_DB: elnadhour_db
      POSTGRES_USER: elnadhour
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # Read from .env file
    volumes:
      - pgdata:/var/lib/postgresql/data  # Save data permanently
    healthcheck:                  # Docker checks if DB is ready
      test: pg_isready

  # CONTAINER 2: Your API
  backend:
    build: ./backend              # Build from backend/Dockerfile
    restart: always
    depends_on:
      db:                         # Wait for database to be ready
        condition: service_healthy
    environment:                  # App configuration
      DB_HOST: db                 # "db" = the database container name
      DB_PORT: 5432
    volumes:
      - uploads:/app/uploads      # Save uploaded images permanently

  # CONTAINER 3: Your Website
  frontend:
    build: ./frontend             # Build from frontend/Dockerfile
    restart: always
    depends_on:
      - backend                   # Start after backend
    ports:
      - "80:80"                   # Port 80 = your website

volumes:
  pgdata:     # Database files survive container restart
  uploads:    # Uploaded images survive container restart
```

---

## Step-by-Step: First Deployment on Your OVH VPS

### Step 1: Buy VPS and Get SSH Access

After buying your OVH VPS (Ubuntu 22.04 or 24.04), you get:
- An **IP address** (example: `51.210.xx.xx`)
- A **root password** (sent by email)

### Step 2: Connect to Your Server

Open PowerShell on your Windows PC:
```bash
ssh root@51.210.xx.xx
```
Type "yes" when asked, then enter your password.

### Step 3: Upload Your Project

**Option A: Using SCP (from your Windows PC)**
```powershell
# Run this from your Windows PowerShell (NOT on the server)
scp -r D:\elnadhour\cafe-app root@51.210.xx.xx:/var/www/elnadhour
```

**Option B: Using Git (recommended for updates)**
```bash
# On the server
mkdir -p /var/www/elnadhour
cd /var/www/elnadhour
git clone YOUR_GITHUB_REPO_URL .
```

### Step 4: Configure Your Passwords

```bash
cd /var/www/elnadhour

# Create .env from template
cp .env.production .env

# Edit it
nano .env
```

Change these values:
```
DB_PASSWORD=MyStr0ngP@ssw0rd123
JWT_SECRET=a_very_long_random_string_abc123xyz789
ALLOWED_ORIGINS=https://elnadhoure-cafe.tn,https://www.elnadhoure-cafe.tn
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 5: Deploy!

```bash
bash deploy.sh
```

This script will:
1. Install Docker automatically
2. Build all 3 containers
3. Start everything
4. Run database migrations
5. Seed your El Nadhour menu

After 2-3 minutes, your site is live at `http://51.210.xx.xx`

### Step 6: Point Your Domain

Go to your `.tn` domain registrar and add DNS records:
- **A record**: `elnadhoure-cafe.tn` -> `51.210.xx.xx`
- **A record**: `www.elnadhoure-cafe.tn` -> `51.210.xx.xx`

Wait 5-30 minutes for DNS to propagate.

### Step 7: Enable HTTPS (after DNS is working)

```bash
bash setup-ssl.sh
```

---

## How to Upload Pictures to Your Server

Your app stores uploaded images in a Docker **volume** called `uploads`.
This means images survive even when you restart or rebuild containers.

### Upload images via the admin panel
1. Go to `https://elnadhoure-cafe.tn/admin`
2. Login with your admin account
3. Upload images for categories, menu items, etc.

### Upload images manually via SCP
```powershell
# From your Windows PC - copy a picture to the server
scp D:\mes-photos\photo.jpg root@51.210.xx.xx:/tmp/

# Then on the server, copy it into the Docker uploads volume
docker cp /tmp/photo.jpg $(docker compose ps -q backend):/app/uploads/
```

### Upload a folder of images
```powershell
# From your Windows PC
scp -r D:\mes-photos\* root@51.210.xx.xx:/tmp/photos/

# On the server
for file in /tmp/photos/*; do
  docker cp "$file" $(docker compose ps -q backend):/app/uploads/
done
```

Your images will be accessible at:
`https://elnadhoure-cafe.tn/uploads/photo.jpg`

---

## How to Update Your App (After Code Changes)

### The easy way: push.ps1 (recommended)

From your Windows PowerShell, in the project folder:

```powershell
.\push.ps1
```

This uploads **only the files you changed** since the last push, then rebuilds
just the affected container. A one-line CSS fix sends a few KB instead of 18 MB.

```powershell
.\push.ps1 -DryRun   # show what would be sent, upload nothing
.\push.ps1 -All      # force a full upload (use after server problems)
```

How it knows what changed: after each successful push it saves an MD5 of every
file in `.push-manifest.json`. Next run it re-hashes and sends only the
differences. If the deploy fails the manifest is left alone, so a retry still
sends the same files.

Delete `.push-manifest.json` to force a full push.

### The manual way

```bash
ssh debian@51.255.47.221
cd /var/www/elnadhour
bash update.sh
```

### Why a rebuild is needed at all

Docker bakes your code *into* the image, so new code needs a new image.

- **Frontend** must recompile: React/JSX source is not what the browser runs.
  Vite bundles it into plain JS/CSS in `dist/`, and that happens during the build.
- **Backend** just needs the new files plus a restart, but since the code lives
  inside the image, it is rebuilt too. Docker's layer cache makes this fast:
  `npm install` is skipped unless `package.json` changed.

Your database and uploaded images live in Docker **volumes**, which are outside
the images, so rebuilds never touch them.

---

## Useful Docker Commands (Cheat Sheet)

### Daily Commands
```bash
# Start all containers
docker compose up -d

# Stop all containers
docker compose down

# See what's running
docker compose ps

# See live logs (Ctrl+C to exit)
docker compose logs -f

# See logs for one service only
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

### Update & Rebuild
```bash
# Rebuild everything and restart
docker compose up -d --build

# Rebuild only backend
docker compose up -d --build backend

# Rebuild only frontend
docker compose up -d --build frontend
```

### Debug Problems
```bash
# Enter the backend container (like SSH into it)
docker compose exec backend sh

# Enter the database container
docker compose exec db psql -U elnadhour elnadhour_db

# Check database tables
docker compose exec db psql -U elnadhour elnadhour_db -c "SELECT * FROM categories;"

# Check container resource usage
docker stats
```

### Manage Images & Space
```bash
# See all Docker images
docker images

# Clean up old unused images (free disk space)
docker system prune -f

# Deep clean (removes all unused data)
docker system prune -a -f
```

### Backup & Restore Database
```bash
# Backup database to file
docker compose exec db pg_dump -U elnadhour elnadhour_db > backup.sql

# Restore from backup
cat backup.sql | docker compose exec -T db psql -U elnadhour elnadhour_db
```

---

## Troubleshooting

### "Container keeps restarting"
```bash
# Check the logs to see the error
docker compose logs backend
```

### "Cannot connect to database"
```bash
# Check if database container is healthy
docker compose ps
# The db service should show "healthy"

# If not, restart it
docker compose restart db
sleep 10
docker compose restart backend
```

### "Website not loading"
```bash
# Check if all 3 containers are running
docker compose ps

# Check nginx logs
docker compose logs frontend

# Check if port 80 is open
curl http://localhost
```

### "Uploaded images disappeared"
```bash
# Check if the volume exists
docker volume ls | grep uploads

# Images are stored in the volume, NOT in the container
# They survive rebuilds. If lost, restore from backup.
```

### "Disk full"
```bash
# Check disk usage
df -h

# Clean Docker cache
docker system prune -a -f
```
