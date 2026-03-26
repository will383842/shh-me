#!/usr/bin/env bash
#
# deploy.sh — Zero-downtime deployment for Shh Me backend
#
# Usage: ./deploy.sh [production|staging]
#
set -euo pipefail

ENV="${1:-production}"
APP_DIR="/var/www/shh-me"
REPO="git@github.com:will383842/shh-me.git"
BRANCH="main"
RELEASE_DIR="$APP_DIR/releases/$(date +%Y%m%d_%H%M%S)"
SHARED_DIR="$APP_DIR/shared"
CURRENT_LINK="$APP_DIR/current"
KEEP_RELEASES=5

echo "==> Deploying Shh Me ($ENV) at $(date)"

# ------------------------------------------------------------------ clone
echo "--- Cloning $BRANCH into $RELEASE_DIR ..."
git clone --depth 1 --branch "$BRANCH" "$REPO" "$RELEASE_DIR"
cd "$RELEASE_DIR/backend"

# ------------------------------------------------------------------ shared
echo "--- Linking shared resources ..."
ln -nfs "$SHARED_DIR/.env" .env
ln -nfs "$SHARED_DIR/storage" storage

# ------------------------------------------------------------------ deps
echo "--- Installing Composer dependencies ..."
composer install --no-dev --optimize-autoloader --no-interaction

# ------------------------------------------------------------------ build
echo "--- Running migrations ..."
php artisan migrate --force

echo "--- Caching config, routes, views ..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "--- Building frontend assets ..."
npm ci --production=false
npm run build

# ------------------------------------------------------------------ switch
echo "--- Switching symlink to new release ..."
ln -nfs "$RELEASE_DIR" "$CURRENT_LINK"

# ------------------------------------------------------------------ reload
echo "--- Reloading PHP-FPM & queue workers ..."
sudo systemctl reload php8.3-fpm || sudo systemctl reload php8.2-fpm || true
php artisan queue:restart

# ------------------------------------------------------------------ cleanup
echo "--- Cleaning old releases (keeping last $KEEP_RELEASES) ..."
cd "$APP_DIR/releases"
ls -1dt */ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

# ------------------------------------------------------------------ smoke
echo "--- Running smoke tests ..."
DOMAIN="https://shh-me.com"
FAIL=0

smoke() {
    local url="$1"
    local expect="${2:-200}"
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
    if [ "$status" -ne "$expect" ]; then
        echo "  FAIL: $url -> $status (expected $expect)"
        FAIL=1
    else
        echo "  OK:   $url -> $status"
    fi
}

smoke "$DOMAIN/"
smoke "$DOMAIN/en"
smoke "$DOMAIN/fr"
smoke "$DOMAIN/privacy"
smoke "$DOMAIN/fr/confidentialite"
smoke "$DOMAIN/terms"
smoke "$DOMAIN/community"
smoke "$DOMAIN/contact"
smoke "$DOMAIN/delete-account"
smoke "$DOMAIN/.well-known/apple-app-site-association"
smoke "$DOMAIN/.well-known/assetlinks.json"
smoke "$DOMAIN/api/health"
smoke "$DOMAIN/sitemap.xml"

if [ "$FAIL" -eq 1 ]; then
    echo ""
    echo "!!! SMOKE TESTS FAILED — consider rolling back: ./rollback.sh"
    exit 1
fi

echo ""
echo "==> Deployment complete at $(date)"
