# Laravel backend for Render
FROM php:8.3-cli

RUN apt-get update && apt-get install -y --no-install-recommends 
    git unzip libpq-dev libzip-dev 
    && docker-php-ext-install pdo_pgsql zip 
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN mkdir -p storage/framework/cache 
    storage/framework/sessions 
    storage/framework/views 
    storage/logs 
    bootstrap/cache 
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 10000

CMD php artisan config:cache && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}
