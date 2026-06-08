<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\Project;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Rate limiting is applied to protect against AWS Free Tier quota overruns
| (Lambda execution limit, API Gateway request limits, etc.)
|
*/

// Portfolio View Route (Rate limited to 30 requests/min to protect Free Tier)
Route::get('/', function () {
    try {
        $projects = Project::all();
    } catch (\Exception $e) {
        Log::error("Failed to fetch projects: " . $e->getMessage());
        $projects = collect();
    }
    return view('portfolio', compact('projects'));
})->name('portfolio')->middleware('throttle:30,1');

// Contact Form Submit Route (Strictly rate-limited to 3 requests/min)
Route::post('/contact', function (Request $request) {
    // Validate fields
    $data = $request->validate([
        'name'    => 'required|string|max:100',
        'email'   => 'required|email|max:100',
        'subject' => 'required|string|max:100',
        'message' => 'required|string|max:1000',
    ]);

    // Anti-spam honeypot
    if ($request->has('honey') && !empty($request->honey)) {
        return response()->json(['message' => 'Your message has been sent successfully!']);
    }

    // Log the message instead of database writes to prevent DynamoDB / local SQLite writing overhead
    Log::info("Contact form submission: " . json_encode($data));

    // Optional Telegram Notification (if credentials are set)
    $botToken = env('TELEGRAM_BOT_TOKEN');
    $chatId = env('TELEGRAM_CHAT_ID');
    if ($botToken && $chatId) {
        try {
            $text = "📩 *New Contact Message*\n\n" .
                    "*Name:* " . $data['name'] . "\n" .
                    "*Email:* " . $data['email'] . "\n" .
                    "*Subject:* " . $data['subject'] . "\n\n" .
                    "*Message:* \n" . $data['message'];
            
            Http::timeout(3)->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => substr($text, 0, 4000),
                'parse_mode' => 'Markdown'
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send Telegram notification: " . $e->getMessage());
        }
    }

    return response()->json(['message' => 'Your message has been sent successfully!']);
})->name('contact.submit')->middleware('throttle:3,1');
