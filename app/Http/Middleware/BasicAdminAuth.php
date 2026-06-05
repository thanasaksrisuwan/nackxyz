<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class BasicAdminAuth
{
    public function handle(Request $request, Closure $next)
    {
        $expectedUsername = env('ADMIN_USERNAME', 'admin');
        $expectedPassword = env('ADMIN_PASSWORD', 'admin123');

        if ($request->getUser() !== $expectedUsername || $request->getPassword() !== $expectedPassword) {
            $headers = ['WWW-Authenticate' => 'Basic realm="Secured Admin Area"'];
            return response('Unauthorized. Secure Binance Bot Area.', 401, $headers);
        }

        return $next($request);
    }
}
