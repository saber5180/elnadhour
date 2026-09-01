#!/bin/bash
# ============================================
# El Nadhour - Upload Images to Server
# ============================================

set -e

SOURCE="${1}"

if [ -z "$SOURCE" ]; then
    echo "Usage: bash upload-images.sh <path-to-images>"
    exit 1
fi

BACKEND_CONTAINER=$(docker compose ps -q backend)

if [ -z "$BACKEND_CONTAINER" ]; then
    echo "Error: Backend container is not running."
    exit 1
fi

if [ -d "$SOURCE" ]; then
    echo "Uploading all images from $SOURCE..."
    COUNT=0
    for file in "$SOURCE"/*.{jpg,jpeg,png,gif,svg,webp} 2>/dev/null; do
        [ -f "$file" ] || continue
        docker cp "$file" "$BACKEND_CONTAINER:/app/uploads/"
        echo "  Uploaded: $(basename "$file")"
        COUNT=$((COUNT + 1))
    done
    echo "Done! $COUNT images uploaded."
elif [ -f "$SOURCE" ]; then
    docker cp "$SOURCE" "$BACKEND_CONTAINER:/app/uploads/"
    echo "Done! Image uploaded."
else
    echo "Error: $SOURCE not found."
    exit 1
fi
