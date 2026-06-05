<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BasicAdminAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $expectedPassword = env('ADMIN_PASSWORD', 'secret');

        if ($request->header('PHP_AUTH_USER') !== 'admin' || $request->header('PHP_AUTH_PW') !== $expectedPassword) {
            return response('Unauthorized', 401, ['WWW-Authenticate' => 'Basic']);
        }

        return $next($request);
    }
}
