#!/bin/bash
# ============================================
# El Nadhour - SSL/HTTPS Setup (Docker)
# ============================================
# Run AFTER DNS points to this server.
# Usage: sudo bash setup-ssl.sh your-email@example.com
# ============================================

set -e

DOMAIN="elnadhoure-cafe.tn"
EMAIL="${1:-admin@elnadhoure-cafe.tn}"

cd "$(dirname "$0")"

echo "========================================="
echo "  Setting up SSL for $DOMAIN"
echo "========================================="

if ! command -v certbot &> /dev/null; then
    echo "[1/5] Installing certbot..."
    apt update
    apt install -y certbot
else
    echo "[1/5] Certbot already installed."
fi

echo "[2/5] Stopping frontend (free port 80 for certbot)..."
docker compose stop frontend

echo "[3/5] Obtaining SSL certificate from Let's Encrypt..."
certbot certonly --standalone \
    -d "$DOMAIN" \
    -d "www.$DOMAIN" \
    --agree-tos \
    --non-interactive \
    --email "$EMAIL"

echo "[4/5] Copying certificates for nginx..."
mkdir -p ./ssl
cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ./ssl/
cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ./ssl/

echo "[5/5] Rebuilding frontend with HTTPS..."
docker compose build frontend
docker compose up -d

echo ""
echo "========================================="
echo "  HTTPS is ready!"
echo "========================================="
echo ""
echo "  Visit: https://$DOMAIN"
echo ""
echo "  Certificate renews automatically via certbot."
echo "  After renew, run: docker compose restart frontend"
echo ""
