# Used by Render (Render has no native PHP runtime, so Laravel runs in Docker)
FROM php:8.3-cli
RUN apt-get update && apt-get install -y git unzip libpq-dev libzip-dev && docker-php-ext-install pdo_pgsql zip
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader
CMD php artisan config:cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
