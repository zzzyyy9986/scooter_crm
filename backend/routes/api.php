<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RentalController;
use App\Http\Controllers\ScooterController;
use App\Http\Controllers\ScooterModelController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/analytics', [AnalyticsController::class, 'index']);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/scooter-models', [ScooterModelController::class, 'index']);
    Route::post('/scooter-models', [ScooterModelController::class, 'store']);
    Route::apiResource('scooters', ScooterController::class);
    Route::apiResource('rentals', RentalController::class)->only(['index', 'store', 'show']);
    Route::post('/rentals/{rental}/complete', [RentalController::class, 'complete']);
});
