<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public routes
    Route::post('/contact', [ContactController::class, 'store']);

    Route::middleware('throttle:6,1')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    // Protected routes — any authenticated user (admin or student)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::patch('/auth/grade', [AuthController::class, 'updateGrade']);
    });

    // Protected routes — admin only
    Route::middleware(['auth:sanctum', 'can:admin'])->group(function () {
        Route::get('/contact', [ContactController::class, 'index']);
    });
});
