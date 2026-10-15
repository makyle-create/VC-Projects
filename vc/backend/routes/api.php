<?php
use App\Http\Controllers\{AuthController, OpportunityController, ReportController, SignupController, NotificationController, ReviewController, OrganizationProfileController, AdminController};
use Illuminate\Support\Facades\Route;
Route::post('/register',[AuthController::class,'register']); Route::post('/login',[AuthController::class,'login']);
Route::get('/opportunities',[OpportunityController::class,'index']); Route::get('/opportunities/{opportunity}',[OpportunityController::class,'show']);
Route::get('/opportunities/{opportunity}/reviews',[ReviewController::class,'index']); Route::get('/organizations/{user}',[OrganizationProfileController::class,'show']);
Route::middleware('auth:sanctum')->group(function(){
 Route::get('/me',[AuthController::class,'me']); Route::put('/me',[AuthController::class,'updateProfile']); Route::put('/me/password',[AuthController::class,'updatePassword']); Route::post('/logout',[AuthController::class,'logout']);
 Route::put('/organization/profile',[OrganizationProfileController::class,'update']);
 Route::post('/opportunities',[OpportunityController::class,'store']); Route::put('/opportunities/{opportunity}',[OpportunityController::class,'update']); Route::delete('/opportunities/{opportunity}',[OpportunityController::class,'destroy']); Route::get('/org/opportunities',[OpportunityController::class,'mine']);
 Route::post('/opportunities/{opportunity}/signup',[SignupController::class,'store']); Route::get('/me/signups',[SignupController::class,'mine']); Route::post('/signups/{signup}/complete',[SignupController::class,'complete']);
 Route::post('/opportunities/{opportunity}/reviews',[ReviewController::class,'store']);
 Route::get('/notifications',[NotificationController::class,'index']); Route::post('/notifications/read-all',[NotificationController::class,'readAll']); Route::post('/notifications/{notification}/read',[NotificationController::class,'read']);
 Route::get('/reports/summary',[ReportController::class,'summary']);
 Route::prefix('admin')->group(function(){Route::get('/summary',[AdminController::class,'summary']);Route::get('/users',[AdminController::class,'users']);Route::get('/opportunities',[AdminController::class,'opportunities']);Route::delete('/opportunities/{opportunity}',[AdminController::class,'removeOpportunity']);Route::patch('/opportunities/{opportunity}',[AdminController::class,'setOpportunityStatus']);});
});
