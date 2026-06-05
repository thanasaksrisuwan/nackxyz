<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

// Protect the dashboard with Basic Auth
Route::middleware('basic.auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index']);
    Route::post('/config', [DashboardController::class, 'saveConfig']);
});
