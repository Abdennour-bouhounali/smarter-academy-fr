<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;

Route::prefix('v1')->group(function () {
    // Setup database (Temporary route)
    Route::get('/setup-database', function () {
        try {
            \Illuminate\Support\Facades\Artisan::call('migrate:fresh', ['--force' => true]);
            
            \App\Models\User::create([
                'first_name' => 'Abdennour',
                'last_name' => 'Bouhounali',
                'email' => 'abdennour.bouhounali@gmail.com',
                'password' => \Illuminate\Support\Facades\Hash::make('***REDACTED-PASSWORD***'),
                'role' => 'admin'
            ]);
            
            return response()->json(['message' => 'Base de données et compte admin (mot de passe: password123) créés avec succès !']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()]);
        }
    });

    // Public routes
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/contact', [ContactController::class, 'store']);
    
    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::get('/contact', [ContactController::class, 'index']);
    });
});
