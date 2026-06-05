<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'basic.auth' => \App\Http\Middleware\BasicAdminAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->reportable(function (Throwable $e) {
            $botToken = env('TELEGRAM_BOT_TOKEN');
            $chatId = env('TELEGRAM_CHAT_ID');
            
            // Only send actual errors (skip standard HTTP exceptions like 404/401)
            if ($botToken && $chatId && !$e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                try {
                    $text = "🚨 *System Error Detected*\n\n" . 
                            "*Message:* `" . $e->getMessage() . "`\n" .
                            "*File:* `" . basename($e->getFile()) . ":" . $e->getLine() . "`";
                    
                    \Illuminate\Support\Facades\Http::timeout(3)->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                        'chat_id' => $chatId,
                        'text' => substr($text, 0, 4000),
                        'parse_mode' => 'Markdown'
                    ]);
                } catch (\Exception $ex) {
                    // Fail silently to not disrupt the main app flow
                }
            }
        });

        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
