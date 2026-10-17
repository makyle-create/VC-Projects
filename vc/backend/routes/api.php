<?php

use App\Http\Controllers\{
    AdminController,
    AuthController,
    NotificationController,
    OpportunityController,
    OrganizationProfileController,
    ReportController,
    ReviewController,
    SignupController
};
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::middleware('throttle:30,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/opportunities', [OpportunityController::class, 'index']);
Route::get('/opportunities/{opportunity}', [OpportunityController::class, 'show']);
Route::get('/opportunities/{opportunity}/reviews', [ReviewController::class, 'index']);
Route::get('/organizations/{user}', [OrganizationProfileController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Authenticated routes (Sanctum bearer token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Account
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/organization/profile', [OrganizationProfileController::class, 'update']);

    // Opportunities (organizations)
    Route::post('/opportunities', [OpportunityController::class, 'store']);
    Route::put('/opportunities/{opportunity}', [OpportunityController::class, 'update']);
    Route::delete('/opportunities/{opportunity}', [OpportunityController::class, 'destroy']);
    Route::get('/org/opportunities', [OpportunityController::class, 'mine']);

    // Sign-ups and hours
    Route::post('/opportunities/{opportunity}/signup', [SignupController::class, 'store']);
    Route::get('/me/signups', [SignupController::class, 'mine']);
    Route::post('/signups/{signup}/complete', [SignupController::class, 'complete']);

    // Reviews
    Route::post('/opportunities/{opportunity}/reviews', [ReviewController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read']);

    // Reports
    Route::get('/reports/summary', [ReportController::class, 'summary']);

    // Admin console (role is re-checked inside AdminController)
    Route::prefix('admin')->group(function () {
        Route::get('/summary', [AdminController::class, 'summary']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/opportunities', [AdminController::class, 'opportunities']);
        Route::delete('/opportunities/{opportunity}', [AdminController::class, 'removeOpportunity']);
        Route::patch('/opportunities/{opportunity}', [AdminController::class, 'setOpportunityStatus']);
    });
});
