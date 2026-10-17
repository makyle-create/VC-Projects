<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Render (and most hosts) terminate HTTPS at a proxy. Trust it so
        // generated URLs (e.g. pagination links) use https instead of http.
        $middleware->trustProxies(at: '*');

        // There is no web login page to redirect guests to (the React app handles
        // that). Laravel's default calls route('login'), which doesn't exist and
        // crashes with a 500 "Route [login] not defined" before the 401 is sent.
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // This backend is a pure JSON API. Always answer /api/* with JSON, even
        // when the client forgets "Accept: application/json". Without this an
        // unauthenticated request tries to redirect to a non-existent "login"
        // route and ends in a confusing 500 error instead of a clean 401.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request, Throwable $e) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
