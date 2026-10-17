#!/bin/sh
set -e

# A missing APP_KEY makes every request crash with "No application encryption
# key has been specified". Set a permanent one in Render's Environment tab
# (run `php artisan key:generate --show` locally). Until then, use a temporary
# key so the API still works. API tokens do not depend on it.
if [ -z "$APP_KEY" ]; then
    echo "WARNING: APP_KEY is not set. Using a temporary key for this run. Add APP_KEY in Render > Environment."
    APP_KEY="$(php artisan key:generate --show)"
    export APP_KEY
fi

# On Render's free tier the database can still be waking up when we boot.
attempt=0
until php artisan migrate --force; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 6 ]; then
        echo "ERROR: migrations failed after $attempt attempts. Check DB_URL / DB_* variables."
        exit 1
    fi
    echo "Database not ready, retrying in 5s ($attempt/6)..."
    sleep 5
done

php artisan config:cache

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}" --no-reload
