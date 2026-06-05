<?php

use App\Http\Controllers\PortfolioController;
use Illuminate\Support\Facades\Route;

// Portfolio Landing Page
Route::get('/', [PortfolioController::class, 'index'])->name('portfolio');

// Contact Form AJAX Submission
Route::post('/contact', [PortfolioController::class, 'contact'])->name('contact.submit');

// Admin Panel routes (for demo simplicity, not protected by complex auth;
// in production, you should protect these routes with authentication)
Route::get('/admin', [PortfolioController::class, 'admin'])->name('admin');
Route::post('/admin/projects', [PortfolioController::class, 'storeProject'])->name('projects.store');
Route::delete('/admin/projects/{project}', [PortfolioController::class, 'deleteProject'])->name('projects.delete');

use App\Http\Controllers\McpController;
Route::post('/mcp', [McpController::class, 'handle']);
