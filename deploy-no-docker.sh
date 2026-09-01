#!/bin/bash
# ============================================
# El Nadhour Cafe - Non-Docker Deployment
# ============================================
# Installs Node.js, PostgreSQL, Nginx, PM2
# directly on the VPS (no Docker).
#
# Usage:  bash deploy-no-docker.sh
# ============================================

set -e

echo "========================================="
echo "  El Nadhour Cafe - Direct Deployment"
echo "========================================="

# ---- Step 1: Install system packages ----
echo "[1/7] Installing system packages..."
apt update && apt upgrade -y

# Node.js 20
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo "       Node.js $(node -v) installed."
else
    echo "       Node.js $(node -v) already installed."
fi

# PostgreSQL
if ! command -v psql &> /dev/null; then
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
    echo "       PostgreSQL installed."
else
    echo "       PostgreSQL already installed."
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
    systemctl enable nginx
    echo "       Nginx installed."
else
    echo "       Nginx already installed."
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "       PM2 installed."
else
    echo "       PM2 already installed."
fi

# ---- Step 2: Set up PostgreSQL database ----
echo "[2/7] Setting up PostgreSQL database..."
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='elnadhour'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER elnadhour WITH PASSWORD 'changeme';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='elnadhour_db'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE elnadhour_db OWNER elnadhour;"
echo "       Database ready. (Remember to change the password!)"

# ---- Step 3: Check backend .env ----
echo "[3/7] Checking backend configuration..."
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    cp "$PROJECT_DIR/backend/.env.production" "$PROJECT_DIR/backend/.env"
    echo ""
    echo "  IMPORTANT: Edit backend/.env and set your DB_PASSWORD and JWT_SECRET!"
    echo "  Run: nano $PROJECT_DIR/backend/.env"
    echo "  Then re-run this script."
    exit 1
fi

# ---- Step 4: Install backend dependencies and migrate ----
echo "[4/7] Setting up backend..."
cd "$PROJECT_DIR/backend"
npm ci --omit=dev
node scripts/migrate.js
node scripts/seed-elnadhour-menu.js
echo "       Backend ready."

# ---- Step 5: Build frontend ----
echo "[5/7] Building frontend..."
cd "$PROJECT_DIR/frontend"
npm ci
npm run build
echo "       Frontend built to dist/."

# ---- Step 6: Start backend with PM2 ----
echo "[6/7] Starting backend with PM2..."
cd "$PROJECT_DIR"
pm2 delete elnadhour-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo "       Backend running via PM2."

# ---- Step 7: Configure Nginx ----
echo "[7/7] Configuring Nginx..."
cp "$PROJECT_DIR/nginx/elnadhour.conf" /etc/nginx/sites-available/elnadhour
ln -sf /etc/nginx/sites-available/elnadhour /etc/nginx/sites-enabled/elnadhour
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
echo "       Nginx configured."

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
echo "  2. Install SSL:"
echo "     apt install -y certbot python3-certbot-nginx"
echo "     certbot --nginx -d elnadhoure-cafe.tn -d www.elnadhoure-cafe.tn"
echo ""
