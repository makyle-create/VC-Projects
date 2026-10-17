<?php

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing
|--------------------------------------------------------------------------
|
| The React app (Netlify / Render static site / localhost) calls this API from
| a different origin. Add your real frontend URL(s) in the CORS_ALLOWED_ORIGINS
| environment variable, comma separated, e.g.
|
|   CORS_ALLOWED_ORIGINS=https://my-app.netlify.app,https://www.mydomain.org
|
| Local development and the usual free hosting subdomains are allowed by the
| patterns below so a fresh deploy works without extra setup.
|
| Authentication uses "Authorization: Bearer" tokens, not cookies, so
| supports_credentials stays false.
*/

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))
    ))),

    'allowed_origins_patterns' => [
        '#^https?://localhost(:\d+)?$#',
        '#^https?://127\.0\.0\.1(:\d+)?$#',
        '#^https://[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app$#',
        '#^https://[a-z0-9-]+\.onrender\.com$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 600,

    'supports_credentials' => false,
];
