#!/usr/bin/env bash
#
# rollback.sh — Roll back to the previous release
#
# Usage: ./rollback.sh
#
set -euo pipefail

APP_DIR="/var/www/shh-me"
RELEASES_DIR="$APP_DIR/releases"
CURRENT_LINK="$APP_DIR/current"

echo "==> Rolling back Shh Me at $(date)"

# Find current and previous release
CURRENT=$(readlink -f "$CURRENT_LINK")
PREVIOUS=$(ls -1dt "$RELEASES_DIR"/*/ | grep -v "$(basename "$CURRENT")" | head -1)

if [ -z "$PREVIOUS" ]; then
    echo "!!! No previous release found. Cannot rollback."
    exit 1
fi

echo "--- Current release:  $CURRENT"
echo "--- Rolling back to:  $PREVIOUS"

# Switch symlink
ln -nfs "$PREVIOUS" "$CURRENT_LINK"

# Reload services
echo "--- Reloading PHP-FPM & queue workers ..."
sudo systemctl reload php8.3-fpm || sudo systemctl reload php8.2-fpm || true
php "$PREVIOUS/backend/artisan" queue:restart

# Run migrations (previous state)
echo "--- Running artisan migrate (previous release) ..."
php "$PREVIOUS/backend/artisan" migrate --force

# Re-cache
echo "--- Re-caching config, routes, views ..."
cd "$PREVIOUS/backend"
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo "==> Rollback complete. Now serving: $(readlink -f "$CURRENT_LINK")"
echo "==> Run smoke tests manually to verify."
