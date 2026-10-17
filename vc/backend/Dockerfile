FROM php:8.3-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libpq-dev libzip-dev \
    && docker-php-ext-install pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# php artisan serve handles several requests at once with workers.
ENV PHP_CLI_SERVER_WORKERS=4

EXPOSE 10000

# Run through `sh` so it works even if the executable bit was lost (e.g. zipped on Windows).
CMD ["sh", "docker-entrypoint.sh"]
