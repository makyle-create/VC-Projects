<?php

use Illuminate\Support\Facades\Route;

// The React app is hosted separately; this service is JSON-only.
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'status' => 'ok',
    'api' => url('/api'),
]));
