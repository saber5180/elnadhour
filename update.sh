#!/bin/bash
# ============================================
# El Nadhour Cafe - Update Script
# ============================================

set -e

TARGET="${1:-all}"

echo "========================================="
echo "  El Nadhour Cafe - Update"
echo "========================================="

case "$TARGET" in

  backend)
    echo "Rebuilding backend only..."
    docker compose up -d --build backend
    echo "Backend updated!"
    ;;

  frontend)
    echo "Rebuilding frontend only..."
    docker compose up -d --build frontend
    echo "Frontend updated!"
    ;;

  migrate)
    echo "Rebuilding all + running migrations..."
    docker compose up -d --build
    sleep 5
    docker compose exec backend node scripts/migrate.js
    echo "All updated with migrations!"
    ;;

  seed)
    echo "Rebuilding all + re-seeding menu..."
    docker compose up -d --build
    sleep 5
    docker compose exec backend node scripts/migrate.js
    docker compose exec backend node scripts/seed-elnadhour-menu.js
    echo "All updated with fresh menu data!"
    ;;

  all)
    echo "Rebuilding everything..."
    docker compose up -d --build
    echo "All services updated!"
    ;;

  *)
    echo "Usage: bash update.sh [backend|frontend|migrate|seed|all]"
    exit 1
    ;;

esac

echo ""
echo "Done! Checking status..."
docker compose ps
echo ""
