#!/bin/bash
# ============================================
# El Nadhour Cafe - Docker Deployment Script
# ============================================
# Run this on your OVH VPS after uploading
# the project files.
#
# Usage:  bash deploy.sh
# ============================================

set -e

echo "========================================="
echo "  El Nadhour Cafe - Docker Deployment"
echo "========================================="

# Step 1: Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo "[1/5] Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    echo "       Docker installed!"
else
    echo "[1/5] Docker already installed."
fi

# Step 2: Check .env file
if [ ! -f .env ]; then
    echo ""
    echo "[WARNING] No .env file found!"
    echo "  Creating from template..."
    cp .env.production .env
    echo ""
    echo "  IMPORTANT: Edit .env and change DB_PASSWORD and JWT_SECRET!"
    echo "  Run: nano .env"
    echo "  Then re-run this script."
    exit 1
fi

# Step 3: Build and start containers
echo "[2/5] Building containers..."
docker compose build

echo "[3/5] Starting services..."
docker compose up -d

# Step 4: Wait for database to be ready
echo "[4/5] Waiting for database..."
sleep 8

# Step 5: Run migrations and seed
echo "[5/5] Running database migrations and seed..."
docker compose exec backend node scripts/migrate.js
docker compose exec backend node scripts/seed-elnadhour-menu.js

echo ""
echo "========================================="
echo "  Deployment complete!"
echo "========================================="
echo ""
echo "  Your app is running at:"
echo "  http://$(hostname -I | awk '{print $1}')"
echo ""
echo "  Next steps:"
echo "  1. Point your domain DNS A record to this server IP"
echo "  2. Set up HTTPS with: bash setup-ssl.sh"
echo ""
